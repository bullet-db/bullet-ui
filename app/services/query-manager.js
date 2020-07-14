/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { pluralize } from 'ember-inflector';
import { Base64 } from 'js-base64';
import { all, resolve } from 'rsvp';
import EmberObject, { computed, get, getProperties } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';
import { isBlank, isEqual, isNone, typeOf } from '@ember/utils';
import config from '../config/environment';
import isEmpty from 'bullet-ui/utils/is-empty';
import { AGGREGATIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
// Validations
import QueryValidations from 'bullet-ui/validators/query';
import ProjectionValidations from 'bullet-ui/validators/projection';
import AggregationValidations from 'bullet-ui/validators/aggregation';
import GroupValidations from 'bullet-ui/validators/group';
import MetricValidations from 'bullet-ui/validators/metric';
import WindowValidations from 'bullet-ui/validators/window';
import validateMultiModelRelationships from 'bullet-ui/validators/multi-model';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';

export default class QueryManagerService extends Service {
  @service store;
  @service querier;
  saveSegmentDebounceInterval = 100;
  debounceSegmentSaves = config.APP.SETTINGS.debounceSegmentSaves;

  @computed('settings').readOnly()
  get windowNumberProperty() {
    let mapping = get(this.settings, 'defaultValues.metadataKeyMapping');
    let { windowSection, windowNumber } = getProperties(mapping, 'windowSection', 'windowNumber');
    return `${windowSection}.${windowNumber}`;
  }

  // Copying

  copyFields(from, to, fields) {
    fields.forEach(field => {
      to.set(field, from.get(field));
    });
  }

  async copyModelRelationship(from, to, fields, inverseName, inverseValue) {
    this.copyFields(from, to, fields);
    to.set(inverseName, inverseValue);
    let saved = await to.save();
    return saved;
  }

  async copyModelAndFields(model, modelName, fields) {
    let copy = await this.store.createRecord(modelName);
    this.copyFields(model, copy, fields);
    let saved = await copy.save();
    return saved;
  }

  async copySingle(source, target, name, inverseName, fields) {
    let original = source.get(name);
    if (!isEmpty(original)) {
      let copy = await this.store.createRecord(name);
      let saved = await this.copyModelRelationship(original, copy, fields, inverseName, target);
      return saved;
    }
  }

  async copyMultiple(source, target, name, inverseName, fields) {
    let originals = source.get(pluralize(name));
    if (!isEmpty(originals)) {
      let promises = [];
      for (let i = 0; i < originals.length; ++i) {
        let copy = await this.store.createRecord(name);
        promises.push(this.copyModelRelationship(originals.objectAt(i), copy, fields, inverseName, target));
      }
      let results = await Promise.allSettled(promises);
      return results.map(result => result.value);
    }
  }

  async copyQuery(query) {
    let copied = await this.store.createRecord('query', {
      name: query.get('name'),
      duration: query.get('duration')
    });
    // Assume prefetched
    let promises = [
      this.copySingle(query, copied, 'filter', 'query', ['clause', 'summary']),
      this.copySingle(query, copied, 'aggregation', 'query', ['type', 'size', 'attributes']),
      query.get('isWindowless') ? Promise.resolve() :
        this.copySingle(query, copied, 'window', 'query', ['emitType', 'emitEvery', 'includeType']),
      this.copyMultiple(query, copied, 'projection', 'query', ['field', 'name'])
    ];

    let results  = await Promise.allSettled(promises);
    let [copiedFilter, copiedAggregation, copiedWindow, copiedProjections] = results.map(result => result.value);

    let originalAggregation = await query.get('aggregation');
    results = await Promise.allSettled([
        this.copyMultiple(originalAggregation, copiedAggregation, 'group', 'aggregation', ['field', 'name']),
        this.copyMultiple(originalAggregation, copiedAggregation, 'metric', 'aggregation', ['type', 'field', 'name'])
    ]);
    let [copiedGroups, copiedMetrics] = results.map(result => result.value);
    if (copiedGroups) {
      copiedAggregation.set('groups', copiedGroups);
    }
    if (copiedMetrics) {
      copiedAggregation.set('metrics', copiedMetrics);
    }
    await copiedAggregation.save();
    if (copiedProjections) {
      copied.set('projections', copiedProjections);
    }
    await copied.save();
    return copied;
  }

  // Transforming

  encodeQuery(query) {
    let querier = this.querier;
    querier.set('apiMode', false);
    let json = querier.reformat(query);
    querier.set('apiMode', true);
    let string = JSON.stringify(json);
    return new Promise(resolve => {
      resolve(Base64.encodeURI(string));
    });
  }

  decodeQuery(hash) {
    let querier = this.querier;
    let buffer = Base64.decode(hash);
    return new Promise(resolve => {
      let json = JSON.parse(buffer.toString());
      resolve(querier.recreate(json));
    });
  }

  // Result manipulation

  addResult(id) {
    return this.store.findRecord('query', id).then(query => {
      let result = this.store.createRecord('result', {
        querySnapshot: {
          type: query.get('aggregation.type'),
          groupsSize: query.get('aggregation.groups.length'),
          metricsSize: query.get('aggregation.metrics.length'),
          projectionsSize: query.get('projections.length'),
          fieldsSummary: query.get('fieldsSummary'),
          filterSummary: query.get('filterSummary'),
          windowSummary: query.get('windowSummary')
        },
        query: query
      });
      query.set('lastRun', result.get('created'));
      return query.save().then(() => {
        return result.save();
      });
    });
  }

  addSegment(result, data) {
    let position = result.get('windows.length');
    result.get('windows').pushObject({
      metadata: data.meta,
      records: data.records,
      sequence: get(data.meta, this.windowNumberProperty),
      index: position,
      created: new Date(Date.now())
    });
    let shouldDebounce = this.debounceSegmentSaves;
    return shouldDebounce ? debounce(result, result.save, this.saveSegmentDebounceInterval) : result.save();
  }

  // Validations

  validationsFor(modelName) {
    switch (modelName) {
      case 'query':
        return QueryValidations;
      case 'projection':
        return ProjectionValidations;
      case 'window':
        return WindowValidations;
      case 'aggregation':
        return AggregationValidations;
      case 'group':
        return GroupValidations;
      case 'metric':
        return MetricValidations;
    }
  }

  createValidationError(messages) {
    if (typeOf(messages) === 'string') {
      messages = [messages];
    }
    return { 'validation' : messages };
  }

  validateChangeset(changeset) {
    if (isNone(changeset)) {
      return resolve([]);
    }
    return changeset.validate().then(() => {
      return resolve(changeset.get('isInvalid') ? changeset.errors : []);
    });
  }

  validateMultiModels(settings, changesets) {
    let validations = validateMultiModelRelationships(settings, changesets);
    return isEmpty(validations) ? validations : [this.createValidationError(validations)];
  }

  validateCollection(collection, message, accumulator = []) {
    let validations = collection.map(item => this.validateChangeset(item));
    return all(validations).then(results => {
      results.filter(result => !isEmpty(result)).forEach(result => {
        accumulator.push(result);
      });
      return resolve(isEmpty(accumulator) ? [] : [this.createValidationError(message)]);
    });
  }

  validate(changesets) {
    let validations = [
      this.validateChangeset(changesets.query),
      this.validateChangeset(changesets.aggregation),
      this.validateChangeset(changesets.window),
      this.validateCollection(changesets.projections, 'Please fix the fields'),
      this.validateCollection(changesets.groups, 'Please fix the fields'),
      this.validateCollection(changesets.metrics, 'Please fix the metrics'),
      resolve(this.validateMultiModels(this.settings, changesets))
    ];
    return all(validations).then(results => {
      let messages = [];
      results.filter(item => !isEmpty(item)).reduce((p, c) => {
        p.push(...c);
        return p;
      }, messages);
      return resolve(messages);
    });
  }

  createChangeset(model, modelName) {
    let validations = this.validationsFor(modelName);
    return new Changeset(model, lookupValidator(validations), validations);
  }

  // Cleanup

  fixFieldLikes(fieldLikes) {
    fieldLikes.forEach(i => {
      if (isBlank(i.get('name'))) {
        i.set('name', i.get('field'));
      }
    });
  }

  removeAttributes(aggregation, ...fields) {
    fields.forEach(field => {
      aggregation.set(`attributes.${field}`, undefined);
    });
  }

  fixAggregationSize(aggregation) {
    let type = aggregation.get('type');
    if (!(isEqual(type, AGGREGATIONS.get('RAW')) || isEqual(type, AGGREGATIONS.get('TOP_K')))) {
      aggregation.set('size', this.get('settings.defaultValues.aggregationMaxSize'));
    }
  }

  autoFill(projections, groups) {
    this.fixFieldLikes(projections);
    this.fixFieldLikes(groups);
  }

  fixDistributionPointType(aggregation) {
    let pointType = aggregation.get('attributes.pointType');
    if (isEqual(pointType, DISTRIBUTION_POINTS.GENERATED)) {
      this.removeAttributes(aggregation, 'numberOfPoints', 'points');
    } else if (isEqual(pointType, DISTRIBUTION_POINTS.NUMBER)) {
      this.removeAttributes(aggregation, 'start', 'end', 'increment', 'points');
    } else {
      this.removeAttributes(aggregation, 'start', 'end', 'increment', 'numberOfPoints');
    }
  }

  cleanup(aggregation, projections, groups) {
    this.autoFill(projections, groups),
    this.fixAggregationSize(aggregation),
    this.fixDistributionPointType(aggregation)
  }

  // Saving

  async mergeChangeset(parentModel, belongsToPath, changeset, inverseName) {
    // If no changeset, need to delete model
    if (isNone(changeset)) {
      await this.deleteSingle(belongsToPath, parentModel, inverseName);
      return;
    }
    let model = await parentModel.get(belongsToPath);
    let relation = await changeset.save();
    let inverse = await relation.get(inverseName);
    // If no inverse, this is a copied changeset model. Delete the original in the parent
    if (isNone(inverse)) {
      await this.deleteSingle(belongsToPath, parentModel, inverseName);
      relation.set(inverseName, parentModel);
      await relation.save();
    }
    // If there was an inverse, nothing else to do. We already saved it.
  }

  async mergeChangesets(parentModel, hasManyPath, changesets, inverseName) {
    if (isEmpty(changesets)) {
      await this.deleteMultiple(hasManyPath, parentModel, inverseName);
      return;
    }
    let models = await parentModel.get(hasManyPath);
    // If there were originals, need to remove all since the order may have changed and destroy ones NOT in the changesets
    if (!isEmpty(models)) {
      let array = models.toArray();
      for (let i = 0; i < array.length; ++i) {
        let model = array[i];
        models.removeObject(model);
        let existingModel = changesets.findBy('id', model.get('id'));
        // If it exists, this model needs to be destroyed since the new changes don't have it
        if (isNone(existingModel)) {
          model.set(inverseName, null);
          await model.destroyRecord();
        }
      }
    }
    // At this point, models should be empty even if it wasn't to begin with. Add the new ones back in the right order
    let newRelation = changesets.toArray();
    for (let i = 0; i < newRelation.length; ++i) {
      let relation = await newRelation[i].save();
      // Could check inverse to see if it exists and not save but simpler to just set and save
      relation.set(inverseName, parentModel);
      await relation.save();
      models.pushObject(relation);
    }
  }

  async save(changesets) {
    let { query, aggregation, filter, window, projections, groups, metrics } = changesets;
    // Apply required changesets
    let queryModel = await query.save();
    let aggregationModel = await aggregation.save();
    // Wipe all optional relations in the query model
    await this.mergeChangesets(aggregationModel, 'groups', groups, 'aggregation');
    await this.mergeChangesets(aggregationModel, 'metrics', metrics, 'aggregation');
    await aggregationModel.save();
    await this.mergeChangeset(queryModel, 'filter', filter, 'query');
    await this.mergeChangeset(queryModel, 'window', window, 'query');
    await this.mergeChangesets(queryModel, 'projections', projections, 'query');
    await queryModel.save();
  }

  // Creating

  createModel(modelName, opts = {}) {
    let model = this.store.createRecord(modelName, opts);
    return model.save();
  }

  // Deleting

  deleteModel(model) {
    // Autosave takes care of updating parent
    model.destroyRecord();
  }

  deleteSingle(name, model, inverseName) {
    return model.get(name).then(item => {
      if (isNone(item)) {
        return resolve();
      }
      item.set(inverseName, null);
      return item.destroyRecord();
    });
  }

  deleteMultipleCollection(collection, inverseName) {
    let promises = collection.toArray().map(item => {
      collection.removeObject(item);
      item.set(inverseName, null);
      item.destroyRecord();
    });
    return all(promises);
  }

  deleteMultiple(name, model, inverseName) {
    return model.get(name).then(items => {
      return this.deleteMultipleCollection(items, inverseName);
    });
  }

  deleteMultipleUnparented(collection, parentName) {
    if (isNone(collection)) {
      return;
    }
    collection.forEach(model => {
      model.get(parentName).then(parent => {
        if (isNone(parent)) {
          this.deleteModel(model);
        }
      });
    });
  }

  deleteAggregation(query) {
    return query.get('aggregation').then(aggregation => {
      this.deleteMultiple('groups', aggregation, 'aggregation');
      this.deleteMultiple('metrics', aggregation, 'aggregation');
      aggregation.set('query', null);
      return aggregation.destroyRecord();
    });
  }

  deleteWindow(query) {
    return query.get('window').then(window => {
      if (isEmpty(window)) {
        return resolve();
      }
      query.set('window', null);
      return query.save().then(() => {
        return window.destroyRecord();
      });
    });
  }

  deleteResults(query) {
    return query.get('results').then(() => {
      return this.deleteMultiple('results', query, 'query').then(() => {
        return query.save();
      });
    });
  }

  deleteQuery(query) {
    return all([
      this.deleteSingle('filter', query, 'query'),
      this.deleteMultiple('projections', query, 'query'),
      this.deleteResults(query),
      this.deleteWindow(query),
      this.deleteAggregation(query)
    ]).then(() => {
      return query.destroyRecord();
    });
  }

  deleteAllUnparented(models) {
    // Aggregations, queries and results can't be unparented
    this.deleteMultipleUnparented(models.filters, 'query');
    this.deleteMultipleUnparented(models.windows, 'query');
    this.deleteMultipleUnparented(models.projections, 'query');
    this.deleteMultipleUnparented(models.groups, 'aggregation');
    this.deleteMultipleUnparented(models.metrics, 'aggregation');
  }

  deleteAllResults() {
    return this.store.findAll('query').then(queries => {
      queries.forEach(q => this.deleteResults(q));
    });
  }
}

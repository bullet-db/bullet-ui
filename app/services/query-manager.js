/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { pluralize } from 'ember-inflector';
import { Base64 } from 'js-base64';
import { all, Promise, resolve } from 'rsvp';
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

  copyFields(from, to, fields) {
    fields.forEach(field => {
      to.set(field, from.get(field));
    });
  }

  copyModelRelationship(from, to, fields, inverseName, inverseValue) {
    this.copyFields(from, to, fields);
    to.set(inverseName, inverseValue);
    return to.save();
  }

  copyModelAndFields(model, modelName, fields) {
    let copy = this.store.createRecord(modelName);
    this.copyFields(model, copy, fields);
    return copy.save();
  }

  copySingle(source, target, name, inverseName, fields) {
    let original = source.get(name);
    if (isEmpty(original)) {
      return resolve();
    }
    let copy = this.store.createRecord(name);
    return this.copyModelRelationship(original, copy, fields, inverseName, target);
  }

  copyMultiple(source, target, name, inverseName, fields) {
    let originals = source.get(pluralize(name));
    if (isEmpty(originals)) {
      return resolve();
    }
    let promises = [];
    originals.forEach(original => {
      let copy = this.store.createRecord(name);
      promises.push(this.copyModelRelationship(original, copy, fields, inverseName, target));
    });
    return all(promises);
  }

  copyQuery(query) {
    let copied = this.store.createRecord('query', {
      name: query.get('name'),
      duration: query.get('duration')
    });
    // Assume prefetched
    let promises = [
      this.copySingle(query, copied, 'filter', 'query', ['clause', 'summary']),
      this.copySingle(query, copied, 'aggregation', 'query', ['type', 'size', 'attributes']),
      query.get('isWindowless') ? resolve() :
        this.copySingle(query, copied, 'window', 'query', ['emitType', 'emitEvery', 'includeType']),
      this.copyMultiple(query, copied, 'projection', 'query', ['field', 'name'])
    ];

    return all(promises).then(([copiedFilter, copiedAggregation, copiedWindow, copiedProjections]) => {
      let originalAggregation = query.get('aggregation');
      return all([
        this.copyMultiple(originalAggregation, copiedAggregation, 'group', 'aggregation', ['field', 'name']),
        this.copyMultiple(originalAggregation, copiedAggregation, 'metric', 'aggregation', ['type', 'field', 'name'])
      ]).then(() => copiedAggregation.save());
    }).then(() => copied.save()).then(() => copied);
  }

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

  // Changesets and validations

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
      this.validateChangeset(changesets.windowChangeset),
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
      resolve(messages);
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

  saveMultipleChangeset(model, hasManyChangeset, inverseName) {
    if (isEmpty(hasManyChangeset)) {
      return resolve();
    }
    let promises = [];
    hasManyChangeset.forEach(relationChangeset => {
      // Apply changeset and then point the relation to the model and save again.
      promises.push(relationChangeset.save().then(relation => {
        relation.set(inverseName, model);
        return relation.save();
      }));
    });
    return all(promises);
  }

  async save(changesets) {
    let { query, aggregation, filter, window, projections, groups, metrics } = changesets;
    // Apply required changesets
    let queryModel = await query.save();
    let aggregationModel = await aggregation.save();
    // Wipe all optional relations in the query model
    await this.deleteOptionalRelations(queryModel);
    await this.saveMultipleChangeset(queryModel, filter, 'query');
    await this.saveMultipleChangeset(queryModel, window, 'query');
    await this.saveMultipleChangeset(queryModel, projections, 'query');
    await this.saveMultipleChangeset(aggregationModel, groups, 'aggregation');
    await this.saveMultipleChangeset(aggregationModel, metrics, 'aggregation');
    await aggregationModel.save();
    await queryModel.save();
  }

  createModel(modelName, opts = {}) {
    let model = this.store.createRecord(modelName, opts);
    return model.save();
  }

  deleteModel(model) {
    // Autosave takes care of updating parent
    model.destroyRecord();
  }

  deleteSingle(name, model, inverseName) {
    return model.get(name).then(item => {
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

  deleteOptionalRelations(query) {
    return query.get('aggregation').then(aggregation => {
      let promises = [
        this.deleteSingle('filter', query, 'query'),
        this.deleteSingle('window', query, 'query'),
        this.deleteMultiple('projections', query, 'query'),
        this.deleteMultiple('groups', aggregation, 'aggregation'),
        this.deleteMultiple('metrics', aggregation, 'aggregation')
      ];
      return all(promises).then(() => aggregation.save());
    }).then(() => query.save());
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

  deleteAllResults() {
    return this.store.findAll('query').then(queries => {
      queries.forEach(q => this.deleteResults(q));
    });
  }
}

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { pluralize } from 'ember-inflector';
import { Base64 } from 'js-base64';
import { computed, get, getProperties } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';
import { isBlank, isEqual, isNone, typeOf } from '@ember/utils';
import config from 'bullet-ui/config/environment';
import isEmpty from 'bullet-ui/utils/is-empty';
import { AGGREGATION_TYPES, DISTRIBUTION_POINT_TYPES } from 'bullet-ui/utils/query-constants';
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
  saveSegmentDebounceInterval = 10;
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
    return to.save();
  }

  async copyModelAndFields(model, modelName, fields) {
    let copy = await this.store.createRecord(modelName);
    this.copyFields(model, copy, fields);
    return copy.save();
  }

  async copySingle(source, target, name, inverseName, fields) {
    let original = source.get(name);
    if (!isEmpty(original)) {
      let copy = await this.store.createRecord(name);
      return this.copyModelRelationship(original, copy, fields, inverseName, target);
    }
  }

  async copyMultiple(source, target, name, inverseName, fields) {
    let originals = source.get(pluralize(name));
    if (!isEmpty(originals)) {
      let promises = [];
      // EmberArray not Array so regular for loop
      for (let i = 0; i < originals.length; ++i) {
        let copy = await this.store.createRecord(name);
        promises.push(this.copyModelRelationship(originals.objectAt(i), copy, fields, inverseName, target));
      }
      return Promise.all(promises);
    }
  }

  async copyQuery(query) {
    let copied = await this.store.createRecord('query', {
      name: query.get('name'),
      duration: query.get('duration')
    });
    // Assume prefetched
    let [, copiedAggregation, ] = await Promise.all([
      this.copySingle(query, copied, 'filter', 'query', ['clause', 'summary']),
      this.copySingle(query, copied, 'aggregation', 'query', ['type', 'size', 'attributes']),
      query.get('isWindowless') ? Promise.resolve() :
        this.copySingle(query, copied, 'window', 'query', ['emitType', 'emitEvery', 'includeType'])
    ]);

    let originalAggregation = await query.get('aggregation');
    let [copiedProjections, copiedGroups, copiedMetrics]  = await Promise.all([
        this.copyMultiple(query, copied, 'projection', 'query', ['field', 'name']),
        this.copyMultiple(originalAggregation, copiedAggregation, 'group', 'aggregation', ['field', 'name']),
        this.copyMultiple(originalAggregation, copiedAggregation, 'metric', 'aggregation', ['type', 'field', 'name'])
    ]);
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
    copied = await copied.save();
    return copied;
  }

  // Transforming

  encodeQuery(query) {
    let querier = this.querier;
    let bql = querier.reformat(query);
    let payload = { name: query.get('name'), bql: bql };
    return new Promise(resolve => {
      resolve(Base64.encodeURI(JSON.stringify(payload)));
    });
  }

  decodeQuery(hash) {
    let querier = this.querier;
    let buffer = Base64.decode(hash);
    return new Promise(resolve => {
      let payload = JSON.parse(buffer.toString());
      let query = querier.recreate(payload.bql);
      query.set('name', payload.name);
      resolve(query);
    });
  }

  // Result manipulation

  async addResult(id) {
    let query = await this.store.findRecord('query', id);
    let result = await this.store.createRecord('result', {
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
    await query.save();
    result = await result.save();
    return result;
  }

  addSegment(result, data) {
    let position = result.get('cache.length');
    result.get('cache').push({
      metadata: data.meta,
      records: data.records,
      sequence: get(data.meta, this.windowNumberProperty),
      index: position,
      created: new Date(Date.now())
    });
    if (this.debounceSegmentSaves) {
      debounce(result, result.syncCache, this.saveSegmentDebounceInterval);
    } else {
      result.syncCache();
    }
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

  dedupErrors(errors) {
    let messages = new Set();
    let deduped = [];
    errors.forEach(error => {
      let hasAllMessages = true;
      error.validation.forEach(message => {
        hasAllMessages = hasAllMessages && messages.has(message);
        messages.add(message);
      });
      if (!hasAllMessages) {
        deduped.push(error);
      }
    });
    return deduped;
  }

  async validateChangeset(changeset) {
    if (isNone(changeset)) {
      return [];
    }
    await changeset.validate();
    return changeset.get('isInvalid') ? this.dedupErrors(changeset.errors) : [];
  }

  validateMultiModels(settings, changesets) {
    let validations = validateMultiModelRelationships(settings, changesets);
    return isEmpty(validations) ? validations : [this.createValidationError(validations)];
  }

  async validateCollection(collection, message) {
    let validations = collection.map(item => this.validateChangeset(item));
    let results = await Promise.all(validations);
    let hasErrors = results.filter(result => !isEmpty(result)).length > 0;
    return hasErrors ? [this.createValidationError(message)] : [];
  }

  async validate(changesets) {
    let validations = [
      this.validateChangeset(changesets.query),
      this.validateChangeset(changesets.aggregation),
      this.validateChangeset(changesets.window),
      this.validateCollection(changesets.projections, 'Please fix the fields'),
      this.validateCollection(changesets.groups, 'Please fix the fields'),
      this.validateCollection(changesets.metrics, 'Please fix the metrics'),
      Promise.resolve(this.validateMultiModels(this.settings, changesets))
    ];
    let results = await Promise.all(validations);
    let messages = [];
    results.filter(item => !isEmpty(item)).reduce((p, c) => {
      p.push(...c);
      return p;
    }, messages);
    return messages;
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
    if (!(isEqual(type, AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW)) ||
          isEqual(type, AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K)))) {
      aggregation.set('size', this.settings.defaultValues?.aggregationMaxSize);
    }
  }

  autoFill(projections, groups) {
    this.fixFieldLikes(projections);
    this.fixFieldLikes(groups);
  }

  wipeAggregationAttributes(aggregation) {
    const fields = ['type', 'pointType', 'newName', 'threshold', 'numberOfPoints', 'start', 'end', 'increment', 'points'];
    for (const field of fields) {
      aggregation.set(`attributes.${field}`, undefined);
    }
  }

  fixAggregationAttributes(aggregation) {
    let pointType = aggregation.get('attributes.pointType');
    if (isEqual(pointType, DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.GENERATED))) {
      this.removeAttributes(aggregation, 'numberOfPoints', 'points');
    } else if (isEqual(pointType, DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER))) {
      this.removeAttributes(aggregation, 'start', 'end', 'increment', 'points');
    } else {
      this.removeAttributes(aggregation, 'start', 'end', 'increment', 'numberOfPoints');
    }
  }

  cleanup(aggregation, projections, groups) {
    this.autoFill(projections, groups),
    this.fixAggregationSize(aggregation),
    this.fixAggregationAttributes(aggregation)
  }

  // Saving

  async mergeChangeset(parentModel, belongsToPath, changeset, inverseName) {
    // If no changeset, need to delete model
    if (isNone(changeset)) {
      await this.deleteSingle(belongsToPath, parentModel, inverseName);
      return;
    }
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
      for (const model of array) {
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
    let newRelations = changesets.toArray();
    for (const newRelation of newRelations) {
      let relation = await newRelation.save();
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

  async createModel(modelName, opts = {}) {
    let model = await this.store.createRecord(modelName, opts);
    return model.save();
  }

  // Deleting

  async deleteModel(model) {
    // Autosave takes care of updating parent.
    return model.destroyRecord();
  }

  async deleteSingle(name, model, inverseName) {
    let item = await model.get(name);
    if (isNone(item)) {
      return;
    }
    item.set(inverseName, null);
    return item.destroyRecord();
  }

  async deleteMultipleCollection(collection, inverseName) {
    let promises = collection.toArray().map(item => {
      collection.removeObject(item);
      item.set(inverseName, null);
      return this.deleteModel(item);
    });
    return Promise.all(promises);
  }

  async deleteMultiple(name, model, inverseName) {
    let items = await model.get(name);
    return this.deleteMultipleCollection(items, inverseName);
  }

  async deleteUnparented(model, parentName) {
    let parent = await model.get(parentName);
    if (isNone(parent)) {
      return this.deleteModel(model);
    }
  }

  async deleteMultipleUnparented(collection, parentName) {
    if (isNone(collection)) {
      return;
    }
    let promises = collection.map(model => this.deleteUnparented(model, parentName));
    return Promise.all(promises);
  }

  async deleteAggregation(query) {
    let aggregation = await query.get('aggregation');
    let promises = [
      this.deleteMultiple('groups', aggregation, 'aggregation'),
      this.deleteMultiple('metrics', aggregation, 'aggregation')
    ];
    await Promise.all(promises);
    aggregation.set('query', null);
    return aggregation.destroyRecord();
  }

  async deleteWindow(query) {
    let window = await query.get('window');
    if (isEmpty(window)) {
      return;
    }
    query.set('window', null);
    await query.save();
    return window.destroyRecord();
  }

  async deleteResults(query) {
    await this.deleteMultiple('results', query, 'query');
    return query.save();
  }

  async deleteQuery(query) {
    await Promise.all([
      this.deleteSingle('filter', query, 'query'),
      this.deleteMultiple('projections', query, 'query'),
      this.deleteResults(query),
      this.deleteWindow(query),
      this.deleteAggregation(query)
    ]);
    return query.destroyRecord();
  }

  async deleteAllUnparented(models) {
    // Aggregations, queries and results can't be unparented
    let promises = [
      this.deleteMultipleUnparented(models.filters, 'query'),
      this.deleteMultipleUnparented(models.windows, 'query'),
      this.deleteMultipleUnparented(models.projections, 'query'),
      this.deleteMultipleUnparented(models.groups, 'aggregation'),
      this.deleteMultipleUnparented(models.metrics, 'aggregation')
    ];
    return Promise.all(promises);
  }

  async deleteAllResults() {
    let queries = await this.store.findAll('query');
    let promises = queries.map(this.deleteResults);
    return Promise.all(promises);
  }
}

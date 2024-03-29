/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { pluralize } from 'ember-inflector';
import { Base64 } from 'js-base64';
import EmberObject, { computed, get, getWithDefault, getProperties } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';
import { isBlank, isEqual, isNone, typeOf } from '@ember/utils';
import config from 'bullet-ui/config/environment';
import isEmpty from 'bullet-ui/utils/is-empty';
import { ATTRIBUTES } from 'bullet-ui/models/aggregation';
import { QUERY_TYPES, getQueryType } from 'bullet-ui/utils/query-type';
import QueryConverter from 'bullet-ui/utils/query-converter';
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
  saveSegmentDebounceInterval = 10;
  debounceSegmentSaves = config.APP.SETTINGS.debounceSegmentSaves;

  @computed('settings').readOnly()
  get windowNumberProperty() {
    let mapping = get(this.settings, 'defaultValues.metadataKeyMapping');
    let { windowSection, windowNumber } = getProperties(mapping, 'windowSection', 'windowNumber');
    return `${windowSection}.${windowNumber}`;
  }

  @computed('settings').readOnly()
  get innerWindowNumberProperty() {
    let mapping = get(this.settings, 'defaultValues.metadataKeyMapping');
    let { innerQuerySection, windowSection, windowNumber } = getProperties(mapping, 'innerQuerySection', 'windowSection', 'windowNumber');
    return `${innerQuerySection}.${windowSection}.${windowNumber}`;
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
      this.copySingle(query, copied, 'aggregation', 'query', ['type', 'size', ...ATTRIBUTES]),
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
    return this.addBQL(copied);
  }

  async copyBQL(bql) {
    return this.createModel('bql', { name: bql.get('name'), query: bql.get('query') });
  }

  async copy(query) {
    let type = getQueryType(query);
    switch (type) {
      case QUERY_TYPES.BUILDER:
        return this.copyQuery(query);
      case QUERY_TYPES.BQL:
        return this.copyBQL(query);
    }
  }

  // Transforming

  encode(query) {
    return new Promise(resolve => {
      let type = getQueryType(query);
      let payload = { name: query.get('name'), type: QUERY_TYPES.forSymbol(type) };
      switch (type) {
        case QUERY_TYPES.BUILDER:
          payload.bql = QueryConverter.createBQL(query);
          break;
        case QUERY_TYPES.BQL:
          payload.bql = query.get('query');
          break;
      }
      resolve(Base64.encodeURI(JSON.stringify(payload)));
    });
  }

  decode(hash) {
    return new Promise(resolve => {
      let buffer = Base64.decode(hash);
      let payload = JSON.parse(buffer.toString());
      let type = QUERY_TYPES.forName(payload.type);
      switch (type) {
        case QUERY_TYPES.BUILDER: {
          let query = QueryConverter.recreateQuery(payload.bql);
          query.set('name', payload.name);
          resolve(query)
          break;
        }
        case QUERY_TYPES.BQL: {
          resolve(EmberObject.create({ name: payload.name, isBQL: true, query: payload.bql }));
          break;
        }
      }
    });
  }

  async addResult(id) {
    let bql = await this.store.findRecord('bql', id);
    let result = await this.store.createRecord('result', {
      querySnapshot: bql.get('query'),
      query: bql
    });
    await bql.save();
    result = await result.save();
    return result;
  }

  addSegment(result, data) {
    let position = result.get('cache.length');
    result.get('cache').push({
      metadata: data.meta,
      records: data.records,
      sequence: getWithDefault(data.meta, this.innerWindowNumberProperty, get(data.meta, this.windowNumberProperty)),
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
      default:
        return { };
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
      aggregation.set(field, undefined);
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
    for (const field of ATTRIBUTES) {
      aggregation.set(field, undefined);
    }
  }

  fixAggregationAttributes(aggregation) {
    let pointType = aggregation.get('pointType');
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
    return queryModel;
  }

  async addBQL(query) {
    let bql = await query.bql;
    if (isEmpty(bql)) {
      bql = this.store.createRecord('bql', {
        name: query.name,
      })
      query.set('bql', bql);
    }
    bql.set('query', QueryConverter.createBQL(query));
    await bql.save();
    return query.save();
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
    return window.destroyRecord();
  }

  async deleteResults(bql) {
    await this.deleteMultiple('results', bql, 'query');
    return bql.save();
  }

  async deleteBQL(bql) {
    await this.deleteResults(bql);
    return bql.destroyRecord();
  }

  async deleteBQLInQuery(query) {
    let bql = await query.get('bql');
    if (isEmpty(bql)) {
      return;
    }
    query.set('bql', null);
    return this.deleteBQL(bql);
  }

  async deleteQuery(query) {
    await Promise.all([
      this.deleteSingle('filter', query, 'query'),
      this.deleteMultiple('projections', query, 'query'),
      this.deleteAggregation(query),
      this.deleteWindow(query),
      this.deleteBQLInQuery(query)
    ]);
    return query.destroyRecord();
  }

  async delete(query) {
    let type = getQueryType(query);
    switch (type) {
      case QUERY_TYPES.BQL:
        return this.deleteBQL(query);
      case QUERY_TYPES.BUILDER:
        return this.deleteQuery(query);
    }
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
    let queries = await this.store.findAll('bql');
    let promises = queries.map(this.deleteResults);
    return Promise.all(promises);
  }
}

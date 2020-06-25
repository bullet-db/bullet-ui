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
import { isBlank, isEqual } from '@ember/utils';
import config from '../config/environment';
import isEmpty from 'bullet-ui/utils/is-empty';
import { AGGREGATIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
import QueryValidation from 'bullet-ui/validators/query';

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

  copyModelRelationship(from, to, fields, inverseName, inverseValue) {
    fields.forEach(field => {
      to.set(field, from.get(field));
    });
    to.set(inverseName, inverseValue);
    return to.save();
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

    return all(promises).then(() => {
      let originalAggregation = query.get('aggregation');
      let copiedAggregation = copied.get('aggregation');
      return all([
        this.copyMultiple(originalAggregation, copiedAggregation, 'group', 'aggregation', ['field', 'name']),
        this.copyMultiple(originalAggregation, copiedAggregation, 'metric', 'aggregation', ['type', 'field', 'name'])
      ]);
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

  /* TO REMOVE
  addFieldLike(childModelName, modelFieldName, model) {
    // Autosave takes care of updating parent model
    let opts = {};
    opts[modelFieldName] = model;
    let childModel = this.store.createRecord(childModelName, opts);
    return childModel.save();
  }
  */

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

  setAggregationAttributes(aggregation, fields) {
    fields.forEach(field => {
      let name = field.get('name');
      let value = field.get('value');
      let fieldPath = `attributes.${name}`;
      let forceSet = field.getWithDefault('forceSet', false);
      if (forceSet || isEmpty(aggregation.get(fieldPath))) {
        aggregation.set(fieldPath, value);
      }
    });
  }

  resetAggregation(aggregation, type, size = 1) {
    aggregation.set('type', type);
    aggregation.set('size', size);
    aggregation.set('attributes', EmberObject.create());
  }

  /* TO REMOVE
  replaceAggregation(query, type, size = 1) {
    return query.get('aggregation').then(aggregation => {
      return all([
        this.deleteMultiple('groups', aggregation, 'aggregation'),
        this.deleteMultiple('metrics', aggregation, 'aggregation')
      ]).then(() => {
        this.resetAggregation(type, size);
        return aggregation.save();
      });
    });
  }
  */

  /* TO REMOVE
  replaceWindow(query, emitType, emitEvery, includeType) {
    return query.get('window').then(window => {
      window.set('emitType', emitType);
      window.set('emitEvery', emitEvery);
      window.set('includeType', includeType);
      return window.save();
    });
  }
  */

  /* TO REMOVE
  addWindow(query) {
    let window = this.store.createRecord('window', {
      query: query
    });
    query.set('window', window);
    return query.save().then(() => {
      return window.save();
    });
  }
  */

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

  save(query, queryChanges, aggregationChanges, projectionsChanges, groupsChanges, metricsChanges, clause, summary) {
    // The underlying relationship saving need not block query saving
    let promises = [
      query.get('filter').then(i => {
        i.set('clause', clause);
        i.set('summary', summary);
        return i.save();
      }),
      query.get('projections').then(p => p.forEach(i => i.save())),
      query.get('aggregation').then(a => {
        let promises = [
          a.get('groups').then(g => g.forEach(i => i.save())),
          a.get('metrics').then(m => m.forEach(i => i.save())),
          a.save()
        ];
        return all(promises);
      }),
      query.get('window').then(w => (isEmpty(w) ? resolve() : w.save())),
      query.save()
    ];
    return all(promises);
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
      item.destroyRecord();
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

  deleteProjections(query) {
    return this.deleteMultiple('projections', query, 'query');
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

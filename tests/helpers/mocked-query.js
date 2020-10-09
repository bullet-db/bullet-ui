/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty } from '@ember/utils';
import { oneWay } from '@ember/object/computed';
import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';

export let MockFilter = EmberObject.extend({
  clause: null,
  summary: null
});

export let MockProjection = EmberObject.extend({
  field: null,
  name: null
});

export let MockAggregation = EmberObject.extend({
  type: null,
  size: null,
  groups: null,
  metrics: null,
  attributes: null,

  init() {
    this.setProperties({ _metrics: A(), _groups: A() });
  }
});

export let MockGroup = EmberObject.extend({
  field: null,
  name: null
});

export let MockMetric = EmberObject.extend({
  type: null,
  field: null,
  name: null
});

export let MockResult = EmberObject.extend({
  metadata: null,
  records: null,
  created: null,
  querySnapshot: null,
  pivotOptions: null
});

export let MockBQL = EmberObject.extend({
  name: null,
  query: null,
  created: null,
  _results: A(),
  isBQL: true
});

export default EmberObject.extend({
  filter: null,
  projections: null,
  aggregation: null,
  bql: null,
  results: null,
  duration: null,
  name: null,
  shouldValidate: true,
  promisify: false,
  window: null,

  init() {
    this.setProperties({
      _filter: EmberObject.create(),
      _projections: A(),
      _aggregation: EmberObject.create(),
      _bql: EmberObject.create(),
      _window: null
    });
    A(['filter', 'projections', 'aggregation', 'bql', 'results', 'window']).forEach(this.topLevelPropertyAsPromise, this);
    this.addBQL(null, 'Mock BQL');
  },

  topLevelPropertyAsPromise(attr) {
    if (this.promisify) {
      this.set(attr, Promise.resolve(this.get(`_${attr}`)));
    } else {
      this.set(attr, this.get(`_${attr}`));
    }
  },

  nestedPropertyAsPromise(top, nested) {
    let attr = `${top}.${nested}`;
    if (this.promisify) {
      this.set(attr, Promise.resolve(this.get(`_${top}._${nested}`)));
    } else {
      this.set(attr, this.get(`_${top}._${nested}`));
    }
  },

  addFilter(clause, summary = '') {
    this.set('_filter', MockFilter.create({ clause, summary }));
    this.topLevelPropertyAsPromise('filter');
  },

  addProjection(field, name) {
    this._projections.pushObject(MockProjection.create({ field, name }));
    this.topLevelPropertyAsPromise('projections');
  },

  addAggregation(type, size = 1, attributes = { }) {
    this.set('_aggregation', MockAggregation.create({ type, size, attributes }));
    this.topLevelPropertyAsPromise('aggregation');
    this.nestedPropertyAsPromise('aggregation', 'groups');
    this.nestedPropertyAsPromise('aggregation', 'metrics');
  },

  addGroup(field, name) {
    let aggregation = this._aggregation;
    aggregation.get('_groups').pushObject(MockGroup.create({ field, name }));
    this.nestedPropertyAsPromise('aggregation', 'groups');
  },

  addMetric(type, field, name) {
    let aggregation = this._aggregation;
    aggregation.get('_metrics').pushObject(MockMetric.create({ type, field, name }));
    this.nestedPropertyAsPromise('aggregation', 'metrics');
  },

  addBQL(name, query, created = new Date(Date.now())) {
    let bql = this._bql;
    this.set('_bql', MockBQL.create({ name, query, created }));
    this.topLevelPropertyAsPromise('bql');
    this.nestedPropertyAsPromise('bql', 'results');
  },

  addResult(records, created = new Date(Date.now()), metadata = null, querySnapshot = null, pivotOptions = null) {
    this._bql._results.pushObject(MockResult.create({ records, created, metadata, querySnapshot, pivotOptions }));
    this.topLevelPropertyAsPromise('results');
  },

  addWindow(emitType, emitEvery, includeType) {
    this.set('_window', EmberObject.create({ emitType, emitEvery, includeType }));
    this.topLevelPropertyAsPromise('window');
  },

  deleteWindow() {
    this.set('_window', null);
    this.topLevelPropertyAsPromise('window');
  },

  validate() {
    let shouldValidate = this.shouldValidate;
    if (shouldValidate) {
      return Promise.resolve({ validations: EmberObject.create({ isValid: true }) });
    }
    return Promise.resolve({ validations: EmberObject.create({ isValid: false, messages: ['Forced to not validate'] }) });
  },

  latestResult: computed('_bql._results.[]', function() {
    let length = this._results?.length;
    return EmberObject.create({ created: new Date(2016, 0, (length + 1) % 30) });
  }),

  query: oneWay('_bql.query')
});

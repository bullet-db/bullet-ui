/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export let MockFilter = Ember.Object.extend({
  clause: null,
  summary: null
});

export let MockProjection = Ember.Object.extend({
  field: null,
  name: null
});

export let MockAggregation = Ember.Object.extend({
  type: null,
  size: null,
  groups: null,
  metrics: null,
  attributes: null,

  init() {
    this.setProperties({ _metrics: Ember.A(), _groups: Ember.A() });
  }
});

export let MockGroup = Ember.Object.extend({
  field: null,
  name: null
});

export let MockMetric = Ember.Object.extend({
  type: null,
  field: null,
  name: null
});

export let MockResult = Ember.Object.extend({
  records: null,
  created: null
});

export default Ember.Object.extend({
  filter: null,
  projections: null,
  aggregation: null,
  results: null,
  duration: null,
  created: null,
  name: null,
  shouldValidate: true,
  promisify: false,

  init() {
    this.setProperties({
      _filter: Ember.Object.create(),
      _projections: Ember.A(),
      _aggregation: Ember.Object.create(),
      _results: Ember.A()
    });
    Ember.A(['filter', 'projections', 'aggregation', 'results']).forEach(this.topLevelPropertyAsPromise, this);
  },

  topLevelPropertyAsPromise(attr) {
    if (this.get('promisify')) {
      this.set(attr, Ember.RSVP.resolve(this.get(`_${attr}`)));
    } else {
      this.set(attr, this.get(`_${attr}`));
    }
  },

  nestedPropertyAsPromise(top, nested) {
    let attr = `${top}.${nested}`;
    if (this.get('promisify')) {
      this.set(attr, Ember.RSVP.resolve(this.get(`_${top}._${nested}`)));
    } else {
      this.set(attr, this.get(`_${top}._${nested}`));
    }
  },

  addFilter(clause, summary = '') {
    this.set('_filter', MockFilter.create({ clause, summary }));
    this.topLevelPropertyAsPromise('filter');
  },

  addProjection(field, name) {
    this.get('_projections').pushObject(MockProjection.create({ field, name }));
    this.topLevelPropertyAsPromise('projections');
  },

  addAggregation(type, size = 1, attributes = { }) {
    this.set('_aggregation', MockAggregation.create({ type, size, attributes }));
    this.topLevelPropertyAsPromise('aggregation');
    this.nestedPropertyAsPromise('aggregation', 'groups');
    this.nestedPropertyAsPromise('aggregation', 'metrics');
  },

  addGroup(field, name) {
    let aggregation = this.get('_aggregation');
    aggregation.get('_groups').pushObject(MockGroup.create({ field, name }));
    this.nestedPropertyAsPromise('aggregation', 'groups');
  },

  addMetric(type, field, name) {
    let aggregation = this.get('_aggregation');
    aggregation.get('_metrics').pushObject(MockMetric.create({ type, field, name }));
    this.nestedPropertyAsPromise('aggregation', 'metrics');
  },

  addResult(records, created = new Date(Date.now())) {
    this.get('_results').pushObject(MockResult.create({ records, created }));
    this.topLevelPropertyAsPromise('results');
  },

  validate() {
    let shouldValidate = this.get('shouldValidate');
    if (shouldValidate) {
      return Ember.RSVP.resolve({ validations: Ember.Object.create({ isValid: true }) });
    }
    return Ember.RSVP.resolve({ validations: Ember.Object.create({ isValid: false, messages: ['Forced to not validate'] }) });
  },

  filterSummary: Ember.computed.oneWay('_filter.summary'),

  fieldsSummary: Ember.computed('_projections.[]', '_aggregation._groups.[]', '_aggregation._metrics.[]', function() {
    let projections = this.concatFieldLikes(this.get('_projections'));
    let groups = this.concatFieldLikes(this.get('_aggregation._groups'));
    let metrics = this.concatFieldLikes(this.get('_aggregation._metrics'));
    let fields = ['newName', 'points', 'numberOfPoints', 'start', 'end', 'increment'];
    let attributes = this.concatProperties(this.get('_aggregation.attributes'), fields);
    return `${projections}${groups}${metrics}${attributes}`;
  }),

  latestResult: Ember.computed('_results.[]', function() {
    let length = this.get('_results.length');
    return Ember.Object.create({ created: new Date(2016, 0, (length + 1) % 30) });
  }),

  concatFieldLikes(fieldLikes) {
    if (Ember.isEmpty(fieldLikes)) {
      return '';
    }
    return fieldLikes.reduce((p, c) => `${p}${c.name}`, '');
  },

  concatProperties(object, fields) {
    if (Ember.isEmpty(object)) {
      return '';
    }
    return fields.reduce((p, c) => {
      let field = object[c];
      return field ? `${p}${field}` : p;
    }, '');
  }
});

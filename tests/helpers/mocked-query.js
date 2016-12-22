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
  size: null
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
    Ember.A(['filter', 'projections', 'aggregation', 'results']).forEach(this.asPromise, this);
  },

  asPromise(attr) {
    if (this.get('promisify')) {
      this.set(attr, Ember.RSVP.resolve(this.get(`_${attr}`)));
    } else {
      this.set(attr, this.get(`_${attr}`));
    }
  },

  addFilter(clause, summary = '') {
    this.set('_filter', MockFilter.create({ clause: clause, summary: summary }));
    this.asPromise('filter');
  },

  addProjection(field, name) {
    this.get('_projections').pushObject(MockProjection.create({ field: field, name: name }));
    this.asPromise('projections');
  },

  addAggregation(type, size = 1) {
    this.set('_aggregation', MockAggregation.create({ type: type, size: size }));
    this.asPromise('aggregation');
  },

  addResult(records, created = new Date(Date.now())) {
    this.get('_results').pushObject(MockResult.create({ records: records, created: created }));
    this.asPromise('results');
  },

  validate() {
    let shouldValidate = this.get('shouldValidate');
    if (shouldValidate) {
      return Ember.RSVP.resolve({ validations: Ember.Object.create({ isValid: true }) });
    }
    return Ember.RSVP.resolve({ validations: Ember.Object.create({ isValid: false, messages: ['Forced to not validate'] }) });
  },

  filterSummary: Ember.computed.oneWay('_filter.summary'),

  projectionsSummary: Ember.computed('_projections.[]', function() {
    return this.get('_projections').reduce((p, c) => `${p}${c.name}`, '');
  }),

  latestResult: Ember.computed('_results.[]', function() {
    let length = this.get('_results.length');
    return Ember.Object.create({ created: new Date(2016, 0, (length + 1) % 30) });
  })
});


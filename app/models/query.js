/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

let Validations = buildValidations({
  duration: {
    description: 'Duration',
    validators: [
      validator('presence', true),
      validator('number', {
        integer: true,
        allowString: true,
        gte: 1,
        message: 'Duration must be a positive integer'
      })
    ]
  },
  projections: validator('has-many'),
  aggregation: validator('belongs-to')
});

export default DS.Model.extend(Validations, {
  name: DS.attr('string'),
  filter: DS.belongsTo('filter'),
  projections: DS.hasMany('projection', { dependent: 'destroy' }),
  aggregation: DS.belongsTo('aggregation'),
  duration: DS.attr('number', { defaultValue: 20 }),
  created: DS.attr('date', {
    defaultValue() {
      return new Date(Date.now());
    }
  }),
  results: DS.hasMany('result', { async: true, dependent: 'destroy' }),

  filterSummary: Ember.computed('filter.summary', function() {
    let summary = this.get('filter.summary');
    return Ember.isEmpty(summary) ? 'None' : summary;
  }).readOnly(),

  projectionsSummary: Ember.computed('projections.@each.name', function() {
    let projections = this.get('projections');
    return Ember.isEmpty(projections) ? 'All' : projections.getEach('name').reject((n) => Ember.isEmpty(n)).join(', ');
  }).readOnly(),

  latestResult: Ember.computed('results.[]', function() {
    let results = this.get('results');
    if (Ember.isEmpty(results)) {
      return null;
    }
    // Earliest date
    let latest = new Date(1);
    let max;
    results.forEach(result => {
      let current = result.get('created');
      if (current > latest) {
        max = result;
        latest = current;
      }
    });
    return max;
  }).readOnly()
});


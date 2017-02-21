/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

let Metric = Ember.Object.extend({
  SUM: 'Sum',
  COUNT: 'Count',
  MIN: 'Minimum',
  MAX: 'Maximum',
  AVG: 'Average',
  INVERSE: {
    'Sum': 'SUM',
    'Count': 'COUNT',
    'Minimum': 'MIN',
    'Maximum': 'MAX',
    'Average': 'AVG'
  },

  invert(key) {
    return this.get(`INVERSE.${key}`);
  },

  asList() {
    return [
      Ember.Object.create({ name: this.get('SUM') }), Ember.Object.create({ name: this.get('COUNT') }),
      Ember.Object.create({ name: this.get('MIN') }), Ember.Object.create({ name: this.get('MAX') }),
      Ember.Object.create({ name: this.get('AVG') })
    ];
  }
});

export const METRICS = Metric.create();

let Validations = buildValidations({
  field: validator('metric-field'),
  aggregation: validator('belongs-to')
});

export default DS.Model.extend(Validations, {
  type: DS.attr('string', { defaultValue: METRICS.get('SUM') }),
  field: DS.attr('string'),
  name: DS.attr('string'),
  aggregation: DS.belongsTo('aggregation', { autoSave: true }),

  hasNoField: Ember.computed('type', function() {
    let type = this.get('type');
    return type === 'Count';
  })
});


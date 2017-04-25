/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

let Aggregation = Ember.Object.extend({
  RAW: 'Raw',
  GROUP: 'Group',
  COUNT_DISTINCT: 'Count Distinct',
  DISTRIBUTION: 'Distribution',
  TOP_K: 'TOP K',
  INVERSE: {
    'Raw': 'RAW',
    'Group': 'GROUP',
    'Count Distinct': 'COUNT_DISTINCT',
    'Distribution': 'DISTRIBUTION',
    'Top K': 'TOP_K'
  },

  invert(key) {
    return this.get(`INVERSE.${key}`);
  }
});

export const AGGREGATIONS = Aggregation.create();

let Validations = buildValidations({
  size: {
    description: 'Maximum records', validators: [
      validator('presence', true),
      validator('number', {
        integer: true,
        allowString: true,
        gte: 1,
        message: 'Maximum records must be a positive integer'
      })
    ]
  },
  groups: validator('has-many'),
  metrics: validator('has-many'),
  query: validator('belongs-to'),
  countDistinctField: validator('count-distinct-field-presence'),
  groupAndOrMetrics: validator('group-metric-presence')
});

export default DS.Model.extend(Validations, {
  type: DS.attr('string', { defaultValue: AGGREGATIONS.get('RAW') }),
  size: DS.attr('number', { defaultValue: 1 }),
  groups: DS.hasMany('group', { dependent: 'destroy' }),
  metrics: DS.hasMany('metric', { dependent: 'destroy' }),
  attributes: DS.attr({ defaultValue: () => Ember.Object.create() }),
  query: DS.belongsTo('query', { autoSave: true })
});

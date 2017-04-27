/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

let AggregationTypes = Ember.Object.extend({
  RAW: 'Raw',
  GROUP: 'Group',
  COUNT_DISTINCT: 'Count Distinct',
  DISTRIBUTION: 'Distribution',
  TOP_K: 'Top K',
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

let RawTypes = Ember.Object.extend({ ALL: 'ALL', SELECT: 'SELECT' });

let DistributionTypes = Ember.Object.extend({
  QUANTILE: 'Quantile',
  PMF: 'PMF',
  CDF: 'CDF',
  INVERSE: {
    'Quantile': 'QUANTILE',
    'PMF': 'PMF',
    'CDF': 'CDF'
  },

  invert(key) {
    return this.get(`INVERSE.${key}`);
  }
});

let DistributionPointTypes = Ember.Object.extend({ NUMBER: 'NUMBER', POINTS: 'POINTS',
                                                    GENERATED: 'GENERATED' });

export const AGGREGATIONS = AggregationTypes.create();
export const RAWS = RawTypes.create();
export const DISTRIBUTIONS = DistributionTypes.create();
export const DISTRIBUTION_POINTS = DistributionPointTypes.create();

let Validations = buildValidations({
  size: {
    description: 'Maximum records', validators: [
      validator('presence', true),
      validator('number', {
        integer: true,
        allowString: true,
        gte: 1,
        message: 'Maximum results must be a positive integer'
      })
    ]
  },
  groups: validator('has-many'),
  metrics: validator('has-many'),
  query: validator('belongs-to'),
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

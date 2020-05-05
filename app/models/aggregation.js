/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import EmberObject from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';

let AggregationTypes = EmberObject.extend({
  RAW: 'Raw',
  GROUP: 'Group',
  COUNT_DISTINCT: 'Count Distinct',
  DISTRIBUTION: 'Distribution',
  TOP_K: 'Top K',

  init() {
    this._super(...arguments);
    this.set('API', {
      'Raw': 'RAW',
      'Group': 'GROUP',
      'Count Distinct': 'COUNT DISTINCT',
      'Distribution': 'DISTRIBUTION',
      'Top K': 'TOP K'
    });
  },

  apiKey(key) {
    return this.get(`API.${key}`);
  }
});

let RawTypes = EmberObject.extend({ ALL: 'All', SELECT: 'Select' });

let DistributionTypes = EmberObject.extend({
  QUANTILE: 'Quantile',
  PMF: 'Frequency',
  CDF: 'Cumulative Frequency',

  init() {
    this._super(...arguments);
    this.set('API', {
      'Quantile': 'QUANTILE',
      'Frequency': 'PMF',
      'Cumulative Frequency': 'CDF'
    });
  },

  apiKey(key) {
    return this.get(`API.${key}`);
  }
});

let DistributionPointTypes = EmberObject.extend({ NUMBER: 'Number', POINTS: 'Points', GENERATED: 'Generated' });

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
      }),
      validator('aggregation-max-size')
    ]
  },
  groups: validator('has-many'),
  metrics: validator('has-many'),
  query: validator('belongs-to'),
  validPoints: validator('valid-points'),
  groupAndOrMetrics: validator('group-metric-presence')
});

export default Model.extend(Validations, {
  type: attr('string'),
  size: attr('number'),
  groups: hasMany('group', { dependent: 'destroy' }),
  metrics: hasMany('metric', { dependent: 'destroy' }),
  attributes: attr({ defaultValue: () => EmberObject.create() }),
  query: belongsTo('query', { autoSave: true })
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import EmberObject from '@ember/object';

let AggregationTypes = EmberObject.extend({
  NAMES: {
    RAW: 'Raw',
    GROUP: 'Group',
    COUNT_DISTINCT: 'Count Distinct',
    DISTRIBUTION: 'Distribution',
    TOP_K: 'Top K'
  },

  init() {
    this._super(...arguments);
    this.setProperties(this.get('NAMES'));
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

let RawTypes = EmberObject.extend({
  NAMES: {
    ALL: 'All',
    SELECT: 'Select'
  },

  init() {
    this._super(...arguments);
    this.setProperties(this.get('NAMES'));
  }
});

let DistributionTypes = EmberObject.extend({
  NAMES: {
    QUANTILE: 'Quantile',
    PMF: 'Frequency',
    CDF: 'Cumulative Frequency'
  },

  init() {
    this._super(...arguments);
    this.setProperties(this.get('NAMES'));
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

let DistributionPointTypes = EmberObject.extend({
  NAMES: {
    NUMBER: 'Number',
    POINTS: 'Points',
    GENERATED: 'Generated'
  },

  init() {
    this._super(...arguments);
    this.setProperties(this.get('NAMES'));
  }
});

export const AGGREGATIONS = AggregationTypes.create();
export const RAWS = RawTypes.create();
export const DISTRIBUTIONS = DistributionTypes.create();
export const DISTRIBUTION_POINTS = DistributionPointTypes.create();

export default class AggregationModel extends Model {
  @attr('string') type;
  @attr('number') size;
  @hasMany('group', { dependent: 'destroy' }) groups;
  @hasMany('metric', { dependent: 'destroy' }) metrics;
  @attr({ defaultValue: () => { } }) attributes;
  @belongsTo('query', { autoSave: true }) query;
}

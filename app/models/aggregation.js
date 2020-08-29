/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import EmberObject from '@ember/object';

let AggregationTypes = EmberObject.extend({
  init() {
    this._super(...arguments);
    let names = {
      RAW: 'Raw',
      GROUP: 'Group',
      COUNT_DISTINCT: 'Count Distinct',
      DISTRIBUTION: 'Distribution',
      TOP_K: 'Top K'
    };
    this.setProperties(names);
    this.set('NAMES', names);
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

let DistributionTypes = EmberObject.extend({
  init() {
    this._super(...arguments);
    let names = { QUANTILE: 'Quantile', PMF: 'Frequency', CDF: 'Cumulative Frequency' };
    this.set('NAMES', names);
    this.setProperties(names);
    this.set('API', { 'Quantile': 'QUANTILE', 'Frequency': 'PMF', 'Cumulative Frequency': 'CDF' });
  },

  apiKey(key) {
    return this.get(`API.${key}`);
  }
});

export const AGGREGATIONS = AggregationTypes.create();
export const DISTRIBUTIONS = DistributionTypes.create();

export default class AggregationModel extends Model {
  @attr('string') type;
  @attr('number') size;
  @hasMany('group', { dependent: 'destroy' }) groups;
  @hasMany('metric', { dependent: 'destroy' }) metrics;
  @attr({ defaultValue: () => EmberObject.create() }) attributes;
  @belongsTo('query', { autoSave: true }) query;
}

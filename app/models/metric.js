/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import EmberObject, { computed } from '@ember/object';

let Metric = EmberObject.extend({
  SUM: 'Sum',
  COUNT: 'Count',
  MIN: 'Minimum',
  MAX: 'Maximum',
  AVG: 'Average',

  init() {
    this._super(...arguments);
    this.set('INVERSE', {
      'Sum': 'SUM',
      'Count': 'COUNT',
      'Minimum': 'MIN',
      'Maximum': 'MAX',
      'Average': 'AVG'
    });
  },

  invert(key) {
    return this.get(`INVERSE.${key}`);
  },

  asList() {
    return [
      EmberObject.create({ name: this.SUM }), EmberObject.create({ name: this.COUNT }),
      EmberObject.create({ name: this.MIN }), EmberObject.create({ name: this.MAX }),
      EmberObject.create({ name: this.AVG })
    ];
  }
});

export const METRICS = Metric.create();

export default class MetricModel extends Model {
  @attr('string', { defaultValue: METRICS.get('SUM') }) type;
  @attr('string') field;
  @attr('string') name;
  @belongsTo('aggregation', { autoSave: true }) aggregation;

  @computed('type')
  get hasNoField() {
    let type = this.type;
    return type === 'Count';
  }
}

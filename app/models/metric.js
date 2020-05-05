/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import EmberObject, { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';

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
      EmberObject.create({ name: this.get('SUM') }), EmberObject.create({ name: this.get('COUNT') }),
      EmberObject.create({ name: this.get('MIN') }), EmberObject.create({ name: this.get('MAX') }),
      EmberObject.create({ name: this.get('AVG') })
    ];
  }
});

export const METRICS = Metric.create();

let Validations = buildValidations({
  field: validator('metric-field'),
  aggregation: validator('belongs-to')
});

export default Model.extend(Validations, {
  type: attr('string', { defaultValue: METRICS.get('SUM') }),
  field: attr('string'),
  name: attr('string'),
  aggregation: belongsTo('aggregation', { autoSave: true }),

  hasNoField: computed('type', function() {
    let type = this.get('type');
    return type === 'Count';
  })
});

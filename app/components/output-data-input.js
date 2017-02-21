/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';

export default Ember.Component.extend({
  classNames: ['output-data-input'],
  query: null,
  columns: null,
  disabled: false,
  subfieldSeparator: '',
  subfieldSuffix: '',
  queryManager: Ember.inject.service(),

  OUTPUT_DATA_TYPES: Ember.Object.create({ RAW: 0, COUNT_DISTINCT: 1, GROUP: 2 }),
  RAW_TYPES: Ember.Object.create({ ALL: 0, SELECT: 1 }),
  metricsList: METRICS.asList(),

  outputDataType: Ember.computed('query.aggregation.type', function() {
    let type = this.get('query.aggregation.type');
    let inverse = AGGREGATIONS.invert(type);
    return this.get(`OUTPUT_DATA_TYPES.${inverse}`);
  }),

  rawType: Ember.computed('query.projections', function() {
    if (Ember.isEmpty(this.get('query.projections'))) {
      return this.get('RAW_TYPES.ALL');
    }
    return this.get('RAW_TYPES.SELECT');
  }),

  isRawAggregation: Ember.computed('outputDataType', function() {
    return this.get('outputDataType') === this.get('OUTPUT_DATA_TYPES.RAW');
  }),

  isGroupAggregation: Ember.computed('outputDataType', function() {
    return this.get('outputDataType') === this.get('OUTPUT_DATA_TYPES.GROUP');
  }),

  isCountDistinctAggregation: Ember.computed('outputDataType', function() {
    return this.get('outputDataType') === this.get('OUTPUT_DATA_TYPES.COUNT_DISTINCT');
  }),

  showRawSelections: Ember.computed('isRawAggregation', 'rawType', function() {
    return this.get('isRawAggregation') && this.get('rawType') === this.get('RAW_TYPES.SELECT');
  }),

  actions: {
    addRawAggregation() {
      this.get('queryManager').replaceAggregation(this.get('query'), AGGREGATIONS.get('RAW'));
    },

    addGroupAggregation() {
      this.get('queryManager').deleteProjections(this.get('query'));
      this.get('queryManager').replaceAggregation(this.get('query'), AGGREGATIONS.get('GROUP'));
    },

    addCountDistinctAggregation() {
      this.get('queryManager').deleteProjections(this.get('query'));
      this.get('queryManager').replaceAggregation(this.get('query'), AGGREGATIONS.get('COUNT_DISTINCT'));
    },

    addFieldLike(childModelName, modelFieldName, modelPath) {
      this.get('queryManager').addFieldLike(childModelName, modelFieldName, this.get(modelPath));
    },

    modifyFieldLike(fieldLike, field) {
      fieldLike.set('field', field);
      fieldLike.set('name', '');
      fieldLike.save();
    },

    deleteProjections() {
      this.get('queryManager').deleteProjections(this.get('query'));
    },

    destroyModel(item) {
      this.get('queryManager').deleteModel(item);
    },

    handleMetricChange(metric, value) {
      metric.set('type', value.get('name'));
      metric.save();
    }
  }
});

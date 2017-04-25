/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { AGGREGATIONS, RAW_TYPES, DISTRIBUTIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';

export default Ember.Component.extend({
  classNames: ['output-data-input'],
  query: null,
  columns: null,
  disabled: false,
  subfieldSeparator: '',
  subfieldSuffix: '',
  queryManager: Ember.inject.service(),

  OUTPUT_DATA_TYPES: AGGREGATIONS,
  DISTRIBUTION_TYPES: DISTRIBUTIONS,
  RAW_TYPES: RAW_TYPES,
  DISTRIBUTION_POINT_TYPES: DISTRIBUTION_POINTS,

  metricsList: METRICS.asList(),

  outputDataType: Ember.computed('query.aggregation.type', function() {
    return this.get('query.aggregation.type');
  }),

  rawType: Ember.computed('query.projections', function() {
    if (Ember.isEmpty(this.get('query.projections'))) {
      return this.get('RAW_TYPES.ALL');
    }
    return this.get('RAW_TYPES.SELECT');
  }),

  distributionType: Ember.computed('query.aggregation.attributes', function() {
    let type = this.get('query.aggregation.attributes.type');
    if (Ember.isEmpty(type)) {
      return this.get('DISTRIBUTION_TYPES.QUANTILE');
    }
    return type;
  }),

  pointType: Ember.computed('query.aggregation.attributes', function() {
    let attributes = this.get('query.aggregation.attributes');
    if (Ember.isEmpty(attributes)) {
      return this.get('DISTRIBUTION_POINT_TYPES.NUMBER');
    }
    let points = Ember.get(attributes, 'points');
    if (!Ember.isEmpty(points)) {
      return this.get('DISTRIBUTION_POINT_TYPES.POINTS');
    }
    let generated = Ember.get(attributes, 'start');
    if (!Ember.isEmpty(generated)) {
      return this.get('DISTRIBUTION_POINT_TYPES.GENERATED');
    }
    return this.get('DISTRIBUTION_POINT_TYPES.NUMBER');
  }),

  isRawAggregation: Ember.computed('outputDataType', function() {
    return Ember.isEqual(this.get('outputDataType'), this.get('OUTPUT_DATA_TYPES.RAW'));
  }),
  isGroupAggregation: Ember.computed('outputDataType', function() {
    return Ember.isEqual(this.get('outputDataType'), this.get('OUTPUT_DATA_TYPES.GROUP'));
  }),
  isCountDistinctAggregation: Ember.computed('outputDataType', function() {
    return Ember.isEqual(this.get('outputDataType'), this.get('OUTPUT_DATA_TYPES.COUNT_DISTINCT'));
  }),
  isDistributionAggregation: Ember.computed('outputDataType', function() {
    return Ember.isEqual(this.get('outputDataType'), this.get('OUTPUT_DATA_TYPES.DISTRIBUTION'));
  }),
  isTopKAggregation: Ember.computed('outputDataType', function() {
    return Ember.isEqual(this.get('outputDataType'), this.get('OUTPUT_DATA_TYPES.TOP_K'));
  }),

  isSelectType: Ember.computed('rawType', function() {
    return Ember.isEqual(this.get('rawType'), this.get('RAW_TYPES.SELECT'));
  }),
  showRawSelections: Ember.computed.and('isRawAggregation', 'isSelectType'),

  isNumberOfPoints: Ember.computed('pointType', function() {
    return Ember.isEqual(this.get('pointType'), this.get('DISTRIBUTION_POINT_TYPES.NUMBER'));
  }),
  isPoints: Ember.computed('pointType', function() {
    return Ember.isEqual(this.get('pointType'), this.get('DISTRIBUTION_POINT_TYPES.POINTS'));
  }),
  isGeneratedPoints: Ember.computed('pointType', function() {
    return Ember.isEqual(this.get('pointType'), this.get('DISTRIBUTION_POINT_TYPES.GENERATED'));
  }),

  changeToNonRawAggregation(type) {
    this.get('queryManager').deleteProjections(this.get('query'));
    return this.get('queryManager').replaceAggregation(this.get('query'), this.get(`OUTPUT_DATA_TYPES.${type}`));
  },

  actions: {
    addRawAggregation() {
      this.get('queryManager').replaceAggregation(this.get('query'), this.get('OUTPUT_DATA_TYPES.RAW'));
    },

    addNonRawAggregation(type) {
      this.changeToNonRawAggregation(type);
    },

    addDistributionAggregation() {
      this.changeToNonRawAggregation('DISTRIBUTION').then(() => {
        this.get('queryManager').addFieldLike('group', 'aggregation', this.get('query.aggregation'));
        let defaultPoints = this.get('settings.defaultValues.distributionNumberOfPoints');
        this.get('queryManager').addAttributeIfNotEmpty(this.get('query'), 'numberOfPoints', defaultPoints);
      });
    },

    addFieldLike(childModelName, modelFieldName, modelPath) {
      this.get('queryManager').addFieldLike(childModelName, modelFieldName, this.get(modelPath));
    },

    modifyDistributionType(type) {
      let aggregation = this.get('query.aggregation');
      aggregation.set('attributes.type', type);
      let quantilePoints = this.get('settings.defaultValues.distributionQuantilePoints');
      if (Ember.isEqual(type, this.get('DISTRIBUTION_TYPES.QUANTILE'))) {
        this.get('queryManager').addAttributeIfNotEmpty(this.get('query'), 'points', quantilePoints);
      } else {
        aggregation.set('attributes.points', '');
      }
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

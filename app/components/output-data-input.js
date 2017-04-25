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

  OUTPUT_DATA_TYPES: Ember.Object.create({ RAW: 'RAW', COUNT_DISTINCT: 'COUNT_DISTINCT',
                                            GROUP: 'GROUP', DISTRIBUTION: 'DISTRIBUTION',
                                            TOP_K: 'TOP_K' }),
  RAW_TYPES: Ember.Object.create({ ALL: 'ALL', SELECT: 'SELECT' }),
  DISTRIBUTION_TYPES: Ember.Object.create({ QUANTILE: 'QUANTILE', PMF: 'PMF', CDF: 'CDF' }),
  DISTRIBUTION_POINT_TYPES: Ember.Object.create({ GENERATED: 'GENERATED', POINTS: 'POINTS', NUMBER: 'NUMBER' }),

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

  distributionType: Ember.computed('query.aggregation.attributes', function() {
    let type = this.get('query.aggregation.attributes.type');
    if (Ember.isEmpty(type)) {
      return this.get('DISTRIBUTION_TYPES.QUANTILE');
    }
    return this.get(`DISTRIBUTION_TYPES.${type}`);
  }),

  isRawAggregation: Ember.computed.equal('outputDataType', 'RAW'),
  isGroupAggregation: Ember.computed.equal('outputDataType', 'GROUP'),
  isCountDistinctAggregation: Ember.computed.equal('outputDataType', 'COUNT_DISTINCT'),
  isDistributionAggregation: Ember.computed.equal('outputDataType', 'DISTRIBUTION'),
  isTopKAggregation: Ember.computed.equal('outputDataType', 'TOP_K'),

  isSelectType: Ember.computed.equal('rawType', 'SELECT'),
  showRawSelections: Ember.computed.and('isRawAggregation', 'isSelectType'),

  haveFields: Ember.computed.notEmpty('query.aggregation.groups'),
  isNumberOfPoints: Ember.computed.equal('pointType', 'NUMBER'),
  isPoints: Ember.computed.equal('pointType', 'POINTS'),
  isGeneratedPoints: Ember.computed.equal('pointType', 'GENERATED'),

  changeToNonRawAggregation(type) {
    this.get('queryManager').deleteProjections(this.get('query'));
    return this.get('queryManager').replaceAggregation(this.get('query'), AGGREGATIONS.get(type));
  },

  actions: {
    addRawAggregation() {
      this.get('queryManager').replaceAggregation(this.get('query'), AGGREGATIONS.get('RAW'));
    },

    addNonRawAggregation(type) {
      this.changeToNonRawAggregation(type);
    },

    addDistributionAggregation() {
      this.changeToNonRawAggregation('DISTRIBUTION').then(() => {
        this.get('queryManager').addFieldLike('group', 'aggregation', this.get('query.aggregation')).then(() => {
          let attributes = this.get('query.aggregation.attributes')
          if (Ember.isEmpty(Ember.get(attributes, 'numberOfPoints'))) {
            this.set('query.aggregation.attributes.numberOfPoints', 11);
          }
        });
      });
    },

    addFieldLike(childModelName, modelFieldName, modelPath) {
      this.get('queryManager').addFieldLike(childModelName, modelFieldName, this.get(modelPath));
    },

    modifyDistributionType(type) {
      let aggregation = this.get('query.aggregation');
      aggregation.set('attributes.type', type);
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

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { AGGREGATIONS, RAWS, DISTRIBUTIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';

export default Ember.Component.extend({
  classNames: ['output-data-input'],
  query: null,
  columns: null,
  disabled: false,
  subfieldSeparator: '',
  subfieldSuffix: '',
  queryManager: Ember.inject.service(),

  // Copy of the imports for the template
  AGGREGATIONS: AGGREGATIONS,
  DISTRIBUTIONS: DISTRIBUTIONS,
  RAWS: RAWS,
  DISTRIBUTION_POINTS: DISTRIBUTION_POINTS,

  metricsList: METRICS.asList(),

  // These *Type computed properties exist because ember-radio-button will set their value locally. Once set,
  // they are independent of the original property.
  outputDataType: Ember.computed('query.aggregation.type', function() {
    return this.findOrDefault('query.aggregation.type', AGGREGATIONS.get('RAW'));
  }),
  rawType: Ember.computed('query.projections.[]', function() {
    return Ember.isEmpty(this.get('query.projections')) ? RAWS.get('ALL') : RAWS.get('SELECT');
  }),
  distributionType: Ember.computed('query.aggregation.attributes', function() {
    return this.findOrDefault('query.aggregation.attributes.type', DISTRIBUTIONS.get('QUANTILE'));
  }),
  pointType: Ember.computed('query.aggregation.attributes', function() {
    return this.findOrDefault('query.aggregation.attributes.pointType', DISTRIBUTION_POINTS.get('NUMBER'));
  }),

  // Helper equalities for template
  isRawAggregation: Ember.computed.equal('outputDataType', AGGREGATIONS.get('RAW')),
  isGroupAggregation: Ember.computed.equal('outputDataType', AGGREGATIONS.get('GROUP')),
  isCountDistinctAggregation: Ember.computed.equal('outputDataType', AGGREGATIONS.get('COUNT_DISTINCT')),
  isDistributionAggregation: Ember.computed.equal('outputDataType', AGGREGATIONS.get('DISTRIBUTION')),
  isTopKAggregation: Ember.computed.equal('outputDataType', AGGREGATIONS.get('TOP_K')),

  isSelectType: Ember.computed.equal('rawType', RAWS.get('SELECT')),
  showRawSelections: Ember.computed.and('isRawAggregation', 'isSelectType'),

  isNumberOfPoints: Ember.computed.equal('pointType', DISTRIBUTION_POINTS.get('NUMBER')),
  isPoints: Ember.computed.equal('pointType', DISTRIBUTION_POINTS.get('POINTS')),
  isGeneratedPoints: Ember.computed.equal('pointType', DISTRIBUTION_POINTS.get('GENERATED')),

  findOrDefault(valuePath, defaultValue) {
    let value = this.get(valuePath);
    if (Ember.isEmpty(value)) {
      return defaultValue;
    }
    return value;
  },

  changeToNonRawAggregation(type) {
    this.get('queryManager').deleteProjections(this.get('query'));
    return this.get('queryManager').replaceAggregation(this.get('query'), type);
  },

  actions: {
    addRawAggregation() {
      this.get('queryManager').replaceAggregation(this.get('query'), AGGREGATIONS.get('RAW'));
    },

    addNonRawAggregation(type) {
      this.changeToNonRawAggregation(type);
    },

    addDistributionAggregation() {
      this.changeToNonRawAggregation(AGGREGATIONS.get('DISTRIBUTION')).then(() => {
        this.get('queryManager').addFieldLike('group', 'aggregation', this.get('query.aggregation'));
        let defaultPoints = this.get('settings.defaultValues.distributionNumberOfPoints');
        this.get('queryManager').setNonEmptyAggregationAttribute(this.get('query'), 'numberOfPoints', defaultPoints);
      });
    },

    addFieldLike(childModelName, modelFieldName, modelPath) {
      this.get('queryManager').addFieldLike(childModelName, modelFieldName, this.get(modelPath));
    },

    modifyDistributionType(type) {
      this.get('queryManager').setAggregationAttribute(this.get('query'), 'type', type);
    },

    modifyDistributionPointType(type) {
      this.get('queryManager').setAggregationAttribute(this.get('query'), 'pointType', type);
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

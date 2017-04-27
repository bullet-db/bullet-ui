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
  forceDirty: false,
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

  canDeleteProjections: Ember.computed('query.projections.[]', function() {
    return this.get('query.projections.length') > 1;
  }),

  canDeleteField: Ember.computed('query.aggregation.groups.[]', function() {
    return this.get('query.aggregation.groups.length') > 1;
  }),

  findOrDefault(valuePath, defaultValue) {
    let value = this.get(valuePath);
    if (Ember.isEmpty(value)) {
      return defaultValue;
    }
    return value;
  },

  getDefaults(type) {
    let values = { points: '', start: '', end: '', increment: '', numberOfPoints: '' };
    if (Ember.isEqual(type, DISTRIBUTIONS.get('QUANTILE'))) {
      values.points = this.get('settings.defaultValues.distributionQuantilePoints');
      values.start = this.get('settings.defaultValues.distributionQuantileStart');
      values.end = this.get('settings.defaultValues.distributionQuantileEnd');
      values.increment = this.get('settings.defaultValues.distributionQuantileIncrement');
    }
    values.numberOfPoints = this.get('settings.defaultValues.distributionNumberOfPoints');
    return values;
  },

  setAttributes(type, pointType) {
    let fields = [];
    let defaults = this.getDefaults(type);
    let lastQuantile = Ember.isEqual(this.get('query.aggregation.attributes.type'), DISTRIBUTIONS.get('QUANTILE'));
    let isQuantile = Ember.isEqual(type, DISTRIBUTIONS.get('QUANTILE'));
    for (let field in defaults) {
      // Wipe the current values if our last type or current type is Quantile but not both -> an XOR operation
      // If you're changing point types within particular distribution type, it shouldn't lose values entered
      // But if you go to QUANTILE or come from QUANTILE, it will wipe all the quantile specific defaults
      fields.push({ name: field, value: defaults[field], forceSet: lastQuantile !== isQuantile });
    }
    fields.push({ name: 'type', value: type, forceSet: true });
    fields.push({ name: 'pointType', value: pointType, forceSet: true });
    this.get('queryManager').setAggregationAttributes(this.get('query'), fields.map(f => Ember.Object.create(f)));
  },

  changeToNonRawAggregation(type) {
    this.get('queryManager').deleteProjections(this.get('query'));
    return this.get('queryManager').replaceAggregation(this.get('query'), type);
  },

  changeToNonRawAggregationWithField(type) {
    return this.changeToNonRawAggregation(type).then(() => {
      return this.get('queryManager').addFieldLike('group', 'aggregation', this.get('query.aggregation'));
    });
  },

  actions: {
    addRawAggregation(addField = false) {
      this.get('queryManager').replaceAggregation(this.get('query'), AGGREGATIONS.get('RAW')).then(() => {
        if (addField) {
          return this.get('queryManager').addFieldLike('projection', 'query', this.get('query'));
        }
      });
    },

    addGroupAggregation() {
      this.changeToNonRawAggregation(AGGREGATIONS.get('GROUP'));
    },

    addOneOrMoreFieldAggregation(type) {
      this.changeToNonRawAggregationWithField(type);
    },

    addDistributionAggregation() {
      this.changeToNonRawAggregationWithField(AGGREGATIONS.get('DISTRIBUTION')).then(() => {
        // Default type is Quantile, Number of Points
        this.setAttributes(DISTRIBUTIONS.get('QUANTILE'), DISTRIBUTION_POINTS.get('NUMBER'));
      });
    },

    addFieldLike(childModelName, modelFieldName, modelPath) {
      this.get('queryManager').addFieldLike(childModelName, modelFieldName, this.get(modelPath));
    },

    modifyDistributionType(type) {
      this.setAttributes(type, this.get('pointType'));
    },

    modifyDistributionPointType(type) {
      this.setAttributes(this.get('distributionType'), type);
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

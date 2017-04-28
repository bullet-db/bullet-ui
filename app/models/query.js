/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';

let Validations = buildValidations({
  duration: {
    description: 'Duration',
    validators: [
      validator('presence', true),
      validator('number', {
        integer: true,
        allowString: true,
        gte: 1,
        message: 'Duration must be a positive integer'
      }),
      validator('query-duration')
    ]
  },
  projections: validator('has-many'),
  aggregation: validator('belongs-to')
});

export default DS.Model.extend(Validations, {
  name: DS.attr('string'),
  filter: DS.belongsTo('filter'),
  projections: DS.hasMany('projection', { dependent: 'destroy' }),
  aggregation: DS.belongsTo('aggregation'),
  duration: DS.attr('number', { defaultValue: 20 }),
  created: DS.attr('date', {
    defaultValue() {
      return new Date(Date.now());
    }
  }),
  results: DS.hasMany('result', { async: true, dependent: 'destroy' }),

  filterSummary: Ember.computed('filter.summary', function() {
    let summary = this.get('filter.summary');
    return Ember.isEmpty(summary) ? 'None' : summary;
  }).readOnly(),

  projectionsSummary: Ember.computed('projections.@each.name', function() {
    return this.summarizeFieldLike(this.get('projections'));
  }).readOnly(),

  groupsSummary: Ember.computed('aggregation.groups.@each.name', function() {
    return this.summarizeFieldLike(this.get('aggregation.groups'));
  }),

  metricsSummary: Ember.computed('aggregation.metrics.@each.type', 'aggregation.metrics.@each.name', function() {
    let metrics = this.getWithDefault('aggregation.metrics', Ember.A());
    return metrics.map(m => {
      let type = m.get('type');
      let field = m.get('field');
      let name = m.get('name');
      if (type === METRICS.get('COUNT')) {
        field = '*';
      }
      return Ember.isEmpty(name) ? `${type}(${field})` : name;
    }).join(', ');
  }),

  aggregationSummary: Ember.computed('aggregation.type', 'aggregation.attributes.{type,newName,threshold}',
                                     'groupsSummary', 'metricsSummary', function() {
    let type = this.get('aggregation.type');
    if (type === AGGREGATIONS.get('RAW')) {
      return '';
    }
    let groupsSummary = this.get('groupsSummary');
    if (type === AGGREGATIONS.get('COUNT_DISTINCT')) {
      return `${type} of (${groupsSummary})`;
    }
    if (type === AGGREGATIONS.get('DISTRIBUTION')) {
      let distributionType = this.get('aggregation.attributes.type');
      return `${distributionType} on ${groupsSummary}`;
    }
    if (type === AGGREGATIONS.get('TOP_K')) {
      let k = this.get('aggregation.size');
      let countField = this.getWithDefault('aggregation.attributes.newName', 'Count');
      let summary = `TOP ${k} of (${groupsSummary})`;
      let threshold = this.get('aggregation.attributes.threshold');
      return Ember.isEmpty(threshold) ? summary : `${summary} with ${countField} >= ${threshold}`;
    }
    // Otherwise 'GROUP'
    let metricsSummary = this.get('metricsSummary');

    if (Ember.isEmpty(metricsSummary)) {
      return groupsSummary;
    } else if (Ember.isEmpty(groupsSummary)) {
      return metricsSummary;
    }
    return `${groupsSummary}, ${metricsSummary}`;
  }),

  fieldsSummary: Ember.computed('projectionsSummary', 'aggregationSummary', function() {
    let projectionsSummary = this.get('projectionsSummary');
    let aggregationSummary = this.get('aggregationSummary');
    if (Ember.isEmpty(aggregationSummary)) {
      // If All fields with Raw Aggregation
      return Ember.isEmpty(projectionsSummary) ? 'All' : projectionsSummary;
    }
    return this.get('aggregationSummary');
  }),

  latestResult: Ember.computed('results.[]', function() {
    let results = this.get('results');
    if (Ember.isEmpty(results)) {
      return null;
    }
    // Earliest date
    let latest = new Date(1);
    let max;
    results.forEach(result => {
      let current = result.get('created');
      if (current > latest) {
        max = result;
        latest = current;
      }
    });
    return max;
  }).readOnly(),

  isRawWithoutFields: Ember.computed('projections.[]', 'aggregation.type', function() {
    return this.get('aggregation.type') === AGGREGATIONS.get('RAW') && Ember.isEmpty(this.get('projections'));
  }),

  summarizeFieldLike(fieldLike) {
    return Ember.isEmpty(fieldLike) ? '' : fieldLike.getEach('name').reject((n) => Ember.isEmpty(n)).join(', ');
  }
});

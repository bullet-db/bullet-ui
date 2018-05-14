/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty, isEqual } from '@ember/utils';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';
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
      validator('query-max-duration')
    ]
  },
  projections: validator('has-many'),
  aggregation: validator('belongs-to'),
  window: {
    description: 'window',
    validators: [
      validator('valid-window'),
      validator('belongs-to')
    ]
  }
});

export default DS.Model.extend(Validations, {
  name: DS.attr('string'),
  filter: DS.belongsTo('filter'),
  projections: DS.hasMany('projection', { dependent: 'destroy' }),
  aggregation: DS.belongsTo('aggregation'),
  window: DS.belongsTo('window'),
  duration: DS.attr('number', { defaultValue: 20 }),
  created: DS.attr('date', {
    defaultValue() {
      return new Date(Date.now());
    }
  }),
  results: DS.hasMany('result', { async: true, dependent: 'destroy' }),

  isWindowless: computed('window', function() {
    return isEmpty(this.get('window.id'));
  }),

  hasUnsavedFields: computed('projections.@each.field', 'aggregation.groups.@each.field', function() {
    let projections = this.getWithDefault('projections', A());
    let groups = this.getWithDefault('aggregation.groups', A());
    return this.hasNoName(projections) || this.hasNoName(groups);
  }).readOnly(),

  filterSummary: computed('filter.summary', function() {
    let summary = this.get('filter.summary');
    return isEmpty(summary) ? 'None' : summary;
  }).readOnly(),

  projectionsSummary: computed('projections.@each.name', function() {
    return this.summarizeFieldLike(this.get('projections'));
  }).readOnly(),

  groupsSummary: computed('aggregation.groups.@each.name', function() {
    return this.summarizeFieldLike(this.get('aggregation.groups'));
  }),

  metricsSummary: computed('aggregation.metrics.@each.{type,name}', function() {
    let metrics = this.getWithDefault('aggregation.metrics', A());
    return metrics.map(m => {
      let type = m.get('type');
      let field = m.get('field');
      let name = m.get('name');
      if (type === METRICS.get('COUNT')) {
        field = '*';
      }
      return isEmpty(name) ? `${type}(${field})` : name;
    }).join(', ');
  }),

  aggregationSummary: computed('aggregation.type', 'aggregation.attributes.{type,newName,threshold}', 'groupsSummary', 'metricsSummary', function() {
    let type = this.get('aggregation.type');
    if (type === AGGREGATIONS.get('RAW')) {
      return '';
    }
    let groupsSummary = this.get('groupsSummary');
    if (type === AGGREGATIONS.get('COUNT_DISTINCT')) {
      return `${type} ON (${groupsSummary})`;
    }
    if (type === AGGREGATIONS.get('DISTRIBUTION')) {
      let distributionType = this.get('aggregation.attributes.type');
      return `${distributionType} ON ${groupsSummary}`;
    }
    if (type === AGGREGATIONS.get('TOP_K')) {
      let k = this.get('aggregation.size');
      let countField = this.getWithDefault('aggregation.attributes.newName', 'Count');
      let summary = `TOP ${k} OF (${groupsSummary})`;
      let threshold = this.get('aggregation.attributes.threshold');
      return isEmpty(threshold) ? summary : `${summary} HAVING ${countField} >= ${threshold}`;
    }
    // Otherwise 'GROUP'
    let metricsSummary = this.get('metricsSummary');

    if (isEmpty(metricsSummary)) {
      return groupsSummary;
    } else if (isEmpty(groupsSummary)) {
      return metricsSummary;
    }
    return `${groupsSummary}, ${metricsSummary}`;
  }),

  fieldsSummary: computed('projectionsSummary', 'aggregationSummary', function() {
    let projectionsSummary = this.get('projectionsSummary');
    let aggregationSummary = this.get('aggregationSummary');
    if (isEmpty(aggregationSummary)) {
      // If All fields with Raw Aggregation
      return isEmpty(projectionsSummary) ? 'All' : projectionsSummary;
    }
    return this.get('aggregationSummary');
  }),

  windowSummary: computed('isWindowless', 'window.{emit.type,emit.every,include.type}', function() {
    if (this.get('isWindowless')) {
      return 'None';
    }
    let emitType = this.get('window.emit.type');
    let emitEvery = this.get('window.emit.every');
    let includeType = this.get('window.include.type');
    return `Every ${emitEvery} ${isEqual(emitType, EMIT_TYPES.get('TIME')) ? 'seconds' : 'records'} ${isEqual(includeType, INCLUDE_TYPES.get('ALL')) ? 'Cumulative' : ''}`;
  }),

  latestResult: computed('results.[]', function() {
    let results = this.get('results');
    if (isEmpty(results)) {
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

  summarizeFieldLike(fieldLike) {
    return isEmpty(fieldLike) ? '' : fieldLike.getEach('name').reject(n => isEmpty(n)).join(', ');
  },

  hasNoName(fieldLike) {
    return isEmpty(fieldLike) ? false : fieldLike.any(f => !isEmpty(f.get('field')) && isEmpty(f.get('name')));
  }
});

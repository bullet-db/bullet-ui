/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isEmpty, isEqual } from '@ember/utils';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { pluralize } from 'ember-inflector';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';
import { METRICS } from 'bullet-ui/models/metric';

export default class QueryModel extends Model {
  @attr('string') name;
  @belongsTo('filter') filter;
  @hasMany('projection', { dependent: 'destroy' }) projections;
  @belongsTo('aggregation') aggregation;
  @belongsTo('window') window;
  @attr('number', { defaultValue: 20 }) duration;
  @attr('date', { defaultValue: () => new Date(Date.now()) }) created;
  @hasMany('result', { async: true, dependent: 'destroy' }) results;

  @computed('window').readOnly()
  get isWindowless() {
    return isEmpty(this.get('window.id'));
  }

  @computed('projections.@each.name', 'aggregation.groups.@each.name').readOnly()
  get hasUnsavedFields() {
    let projections = this.getWithDefault('projections', A());
    let groups = this.getWithDefault('aggregation.groups', A());
    return this.hasNoName(projections) || this.hasNoName(groups);
  }

  @computed('filter.summary').readOnly()
  get filterSummary() {
    let summary = this.get('filter.summary');
    return isEmpty(summary) ? 'None' : summary;
  }

  @computed('projections.@each.name').readOnly()
  get projectionsSummary() {
    return this.summarizeFieldLike(this.projections);
  }

  @computed('aggregation.groups.@each.name').readOnly()
  get groupsSummary() {
    return this.summarizeFieldLike(this.get('aggregation.groups'));
  }

  @computed('aggregation.metrics.@each.{kind,name}').readOnly()
  get metricsSummary() {
    let metrics = this.getWithDefault('aggregation.metrics', A());
    return metrics.map(m => {
      let kind = m.get('kind');
      let field = m.get('field');
      let name = m.get('name');
      if (kind === METRICS.get('COUNT')) {
        field = '*';
      }
      return isEmpty(name) ? `${kind}(${field})` : name;
    }).join(', ');
  }

  @computed('aggregation.{type,size}', 'aggregation.attributes.{type,newName,threshold}', 'groupsSummary', 'metricsSummary').readOnly()
  get aggregationSummary() {
    let type = this.get('aggregation.type');
    if (type === AGGREGATIONS.get('RAW')) {
      return '';
    }
    let groupsSummary = this.groupsSummary;
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
    let metricsSummary = this.metricsSummary;

    if (isEmpty(metricsSummary)) {
      return groupsSummary;
    } else if (isEmpty(groupsSummary)) {
      return metricsSummary;
    }
    return `${groupsSummary}, ${metricsSummary}`;
  }


  @computed('projectionsSummary', 'aggregationSummary').readOnly()
  get fieldsSummary() {
    let projectionsSummary = this.projectionsSummary;
    let aggregationSummary = this.aggregationSummary;
    if (isEmpty(aggregationSummary)) {
      // If All fields with Raw Aggregation
      return isEmpty(projectionsSummary) ? 'All' : projectionsSummary;
    }
    return this.aggregationSummary;
  }

  @computed('isWindowless', 'window.{emitType,emitEvery,includeType}').readOnly()
  get windowSummary() {
    if (this.isWindowless) {
      return 'None';
    }
    let emitType = this.get('window.emitType');
    let emitEvery = this.get('window.emitEvery');
    let includeType = this.get('window.includeType');
    return `Every ${emitEvery} ${this.getEmitUnit(emitType, emitEvery)}${this.getIncludeType(includeType)}`;
  }

  @computed('results.[]').readOnly()
  get latestResult() {
    let results = this.results;
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
  }

  summarizeFieldLike(fieldLike) {
    return isEmpty(fieldLike) ? '' : fieldLike.getEach('name').reject(n => isEmpty(n)).join(', ');
  }

  hasNoName(fieldLike) {
    return isEmpty(fieldLike) ? false : fieldLike.any(f => !isEmpty(f.get('field')) && isEmpty(f.get('name')));
  }

  getEmitUnit(emitType, emitEvery) {
    let unit = isEqual(emitType, EMIT_TYPES.get('TIME')) ? 'second' : 'record';
    return Number(emitEvery) === 1 ? unit : pluralize(unit);
  }

  getIncludeType(includeType) {
    return isEqual(includeType, INCLUDE_TYPES.get('ALL')) ? ', Cumulative' : '';
  }
}

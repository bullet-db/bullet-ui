/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

/* eslint-disable ember/no-get */
// Need to disable since gets are needed here for ObjectProxy

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isEmpty, isEqual } from '@ember/utils';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { pluralize } from 'ember-inflector';
import { AGGREGATION_TYPES, METRIC_TYPES, EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/utils/query-constants';

export default class QueryModel extends Model {
  @attr('string') name;
  @belongsTo('filter') filter;
  @hasMany('projection', { dependent: 'destroy' }) projections;
  @belongsTo('aggregation') aggregation;
  @belongsTo('window') window;
  @attr('number', { defaultValue: 20000 }) duration;
  @belongsTo('bql') bql;

  @computed('window.id')
  get isWindowless() {
    return isEmpty(this.get('window.id'));
  }

  @computed('filter.summary')
  get filterSummary() {
    let summary = this.get('filter.summary');
    return isEmpty(summary) ? 'None' : summary;
  }

  @computed('projections.@each.name')
  get projectionsSummary() {
    return QueryModel.summarizeFieldLike(this.projections);
  }

  @computed('aggregation.groups.@each.name')
  get groupsSummary() {
    return QueryModel.summarizeFieldLike(this.get('aggregation.groups'));
  }

  @computed('aggregation.metrics.@each.{type,name}')
  get metricsSummary() {
    let metrics = (this.get('aggregation.metrics') === undefined ? A() : this.get('aggregation.metrics'));
    return metrics.map(m => {
      let type = m.get('type');
      let field = m.get('field');
      let name = m.get('name');
      if (type === METRIC_TYPES.describe(METRIC_TYPES.COUNT)) {
        field = '*';
      }
      return isEmpty(name) ? `${type}(${field})` : name;
    }).join(', ');
  }

  @computed('aggregation.{type,size}', 'aggregation.attributes.{type,newName,threshold}', 'groupsSummary', 'metricsSummary')
  get aggregationSummary() {
    let type = this.get('aggregation.type');
    if (type === AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW)) {
      return '';
    }
    let groupsSummary = this.groupsSummary;
    if (type === AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT)) {
      return `${type} ON (${groupsSummary})`;
    }
    if (type === AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION)) {
      let distributionType = this.get('aggregation.attributes.type');
      return `${distributionType} ON ${groupsSummary}`;
    }
    if (type === AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K)) {
      let k = this.get('aggregation.size');
      let countField = (this.get('aggregation.attributes.newName') === undefined ? 'Count' : this.get('aggregation.attributes.newName'));
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


  @computed('projectionsSummary', 'aggregationSummary')
  get fieldsSummary() {
    let projectionsSummary = this.projectionsSummary;
    let aggregationSummary = this.aggregationSummary;
    if (isEmpty(aggregationSummary)) {
      // If All fields with Raw Aggregation
      return isEmpty(projectionsSummary) ? 'All' : projectionsSummary;
    }
    return this.aggregationSummary;
  }

  @computed('isWindowless', 'window.{emitType,emitEvery,includeType}')
  get windowSummary() {
    if (this.isWindowless) {
      return 'None';
    }
    let emitType = this.get('window.emitType');
    let emitEvery = this.get('window.emitEvery');
    let includeType = this.get('window.includeType');
    return `Every ${emitEvery} ${QueryModel.getEmitUnit(emitType, emitEvery)}${QueryModel.getIncludeType(includeType)}`;
  }

  static summarizeFieldLike(fieldLike) {
    return isEmpty(fieldLike) ? '' : fieldLike.getEach('name').reject(n => isEmpty(n)).join(', ');
  }

  static getEmitUnit(emitType, emitEvery) {
    let unit = isEqual(emitType, EMIT_TYPES.describe(EMIT_TYPES.TIME)) ? 'millisecond' : 'record';
    return Number(emitEvery) === 1 ? unit : pluralize(unit);
  }

  static getIncludeType(includeType) {
    return isEqual(includeType, INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL)) ? ', Cumulative' : '';
  }
}

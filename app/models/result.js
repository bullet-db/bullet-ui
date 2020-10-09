/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
/* eslint-disable ember/no-get */
// Need to disable since gets are needed here for ObjectProxy
import Model, { attr, belongsTo } from '@ember-data/model';
import { equal } from '@ember/object/computed';
import { isEmpty, isNone } from '@ember/utils';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import QueryConverter from 'bullet-ui/utils/query-converter';
import { AGGREGATION_TYPES } from 'bullet-ui/utils/query-constants';

export default class ResultModel extends Model {
  // Cache exists to not dump all the records into windows at once. Use syncCache to consolidate cache and windows.
  cache = [];

  @attr('date', { defaultValue: () => new Date(Date.now()) }) created;
  @belongsTo('bql', { autoSave: true }) query;
  // Not using hasMany to handle extremely high volume (rate-limited) results.
  @attr('window-array', { defaultValue: () => A() }) windows;
  @attr('string') pivotOptions;
  @attr('string') querySnapshot;

  @computed('querySnapshot')
  get parsedQuery() {
    return QueryConverter.parse(this.querySnapshot);
  }

  get type() {
    return QueryConverter.classify(this.parsedQuery);
  }

  @equal('type', AGGREGATION_TYPES.RAW) isRaw;
  @equal('type', AGGREGATION_TYPES.COUNT_DISTINCT) isCountDistinct;
  @equal('type', AGGREGATION_TYPES.GROUP) isGroup;
  @equal('type', AGGREGATION_TYPES.DISTRIBUTION) isDistribution;
  @equal('type', AGGREGATION_TYPES.TOP_K) isTopK;

  get isReallyRaw() {
    return this.isRaw && this.parsedQuery?.select?.indexOf('*') !== -1;
  }

  get isSingleRow() {
    return this.isCountDistinct || (this.isGroup && isEmpty(this.parsedQuery?.groupBy));
  }

  @computed('windows.[]')
  get errorWindow() {
    return this.windows.find(window => !isNone(window.metadata.errors));
  }

  @computed('windows.[]')
  get hasData() {
    return !isEmpty(this.windows);
  }

  @computed('errorWindow')
  get hasError() {
    return !isNone(this.errorWindow);
  }

  syncCache() {
    let length = this.cache.length;
    let numberOfWindows = this.windows.length;
    for (let i = numberOfWindows; i < length; ++i) {
      this.windows.pushObject(this.cache[i]);
    }
    this.save();
  }
}

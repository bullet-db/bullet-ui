/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import { equal, or } from '@ember/object/computed';
import { isEmpty, isNone } from '@ember/utils';
import { A } from '@ember/array';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

export default class ResultModel extends Model{
  @attr('date', { defaultValue: () => new Date(Date.now()) }) created;
  @belongsTo('query', { autoSave: true }) query;
  // Not using hasMany to handle extremely high volume (rate-limited) results.
  @attr('window-array', { defaultValue: () => A() }) windows;
  @attr('string') pivotOptions;
  @attr() querySnapshot;

  @equal('querySnapshot.type', AGGREGATIONS.get('RAW')) isRaw;
  @equal('querySnapshot.type', AGGREGATIONS.get('COUNT_DISTINCT')) isCountDistinct;
  @equal('querySnapshot.type', AGGREGATIONS.get('GROUP')) isGroup;
  @equal('querySnapshot.type', AGGREGATIONS.get('DISTRIBUTION')) isDistribution;
  @equal('querySnapshot.type', AGGREGATIONS.get('TOP_K')) isTopK;
  @or('isCountDistinct', 'isGroupAll') isSingleRow;

  get isReallyRaw() {
    return this.isRaw && this.get('querySnapshot.projectionsSize') === 0;
  }

  get isGroupAll() {
    return this.isGroup && this.get('querySnapshot.groupsSize') === 0;
  }

  get isGroupBy() {
    return this.isGroup && this.get('querySnapshot.metricsSize') >= 1 && this.get('querySnapshot.groupsSize') >= 1;
  }

  get hasError() {
    return !isNone(this.windows.find(window => !isNone(window.metadata.errors)));
  }

  get errorWindow() {
    return this.windows.find(window => !isNone(window.metadata.errors));
  }

  get hasData() {
    return !isEmpty(this.windows);
  }
}

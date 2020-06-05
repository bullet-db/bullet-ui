/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import { equal, or } from '@ember/object/computed';
import { isEmpty, isNone } from '@ember/utils';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

export default class ResultModel extends Model{
  @attr('date', {
    defaultValue() {
      return new Date(Date.now());
    }
  }) created;
  @belongsTo('query', { autoSave: true }) query;
  // Not using hasMany to handle extremely high volume (rate-limited) results.
  @attr('window-array', { defaultValue: () => A() }) windows;
  @attr('string') pivotOptions;
  @attr() querySnapshot;

  @equal('querySnapshot.type', AGGREGATIONS.get('RAW')).readOnly() isRaw;
  @equal('querySnapshot.type', AGGREGATIONS.get('COUNT_DISTINCT')).readOnly() isCountDistinct;
  @equal('querySnapshot.type', AGGREGATIONS.get('GROUP')).readOnly() isGroup;
  @equal('querySnapshot.type', AGGREGATIONS.get('DISTRIBUTION')).readOnly() isDistribution;
  @equal('querySnapshot.type', AGGREGATIONS.get('TOP_K')).readOnly() isTopK;
  @or('isCountDistinct', 'isGroupAll').readOnly() isSingleRow;

  @computed('isRaw', 'querySnapshot.projectionsSize').readOnly()
  get isReallyRaw() {
    return this.isRaw && this.get('querySnapshot.projectionsSize') === 0;
  }

  @computed('isGroup', 'querySnapshot.groupsSize').readOnly()
  get isGroupAll() {
    return this.isGroup && this.get('querySnapshot.groupsSize') === 0;
  }

  @computed('isGroup', 'querySnapshot.{metricsSize,groupsSize}').readOnly()
  get isGroupBy() {
    return this.isGroup && this.get('querySnapshot.metricsSize') >= 1 && this.get('querySnapshot.groupsSize') >= 1;
  }

  @computed('windows.[]').readOnly()
  get errorWindow() {
    return this.windows.find(window => !isNone(window.metadata.errors));
  }

  @computed('windows.[]').readOnly()
  get hasData() {
    return !isEmpty(this.windows);
  }
}

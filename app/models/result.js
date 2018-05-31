/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { equal, or, alias } from '@ember/object/computed';
import { isEmpty, isNone } from '@ember/utils';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import DS from 'ember-data';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

export default DS.Model.extend({
  created: DS.attr('date', {
    defaultValue() {
      return new Date(Date.now());
    }
  }),
  query: DS.belongsTo('query', { autoSave: true }),

  // Not using hasMany to handle extremely high volume (rate-limited) results.
  windows: DS.attr({
    defaultValue() {
      return A();
    }
  }),

  pivotOptions: DS.attr('string'),
  querySnapshot: DS.attr(),
  selectedWindowIndex: DS.attr('number', { defaultValue: -1 }),
  hasError: DS.attr('boolean', { defaultValue: false }),

  isRaw: equal('querySnapshot.type', AGGREGATIONS.get('RAW')).readOnly(),
  isCountDistinct: equal('querySnapshot.type', AGGREGATIONS.get('COUNT_DISTINCT')).readOnly(),
  isGroup: equal('querySnapshot.type', AGGREGATIONS.get('GROUP')).readOnly(),
  isDistribution: equal('querySnapshot.type', AGGREGATIONS.get('DISTRIBUTION')).readOnly(),
  isTopK: equal('querySnapshot.type', AGGREGATIONS.get('TOP_K')).readOnly(),

  isReallyRaw: computed('isRaw', 'querySnapshot.projectionsSize', function() {
    return this.get('isRaw') && this.get('querySnapshot.projectionsSize') === 0;
  }).readOnly(),

  isGroupAll: computed('isGroup', 'querySnapshot.groupsSize', function() {
    return this.get('isGroup') && this.get('querySnapshot.groupsSize') === 0;
  }).readOnly(),

  isGroupBy: computed('isGroup', 'querySnapshot.{metricsSize,groupsSize}', function() {
    return this.get('isGroup') && this.get('querySnapshot.metricsSize') >= 1 && this.get('querySnapshot.groupsSize') >= 1;
  }).readOnly(),

  isSingleRow: or('isCountDistinct', 'isGroupAll').readOnly()
});

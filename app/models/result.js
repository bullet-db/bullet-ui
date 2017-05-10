/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

export default DS.Model.extend({
  metadata: DS.attr({
    defaultValue() {
      return Ember.Object.create();
    }
  }),
  records: DS.attr({
    defaultValue() {
      return Ember.A();
    }
  }),
  created: DS.attr('date', {
    defaultValue() {
      return new Date(Date.now());
    }
  }),
  query: DS.belongsTo('query', { autoSave: true }),
  querySnapshot: DS.attr(),
  pivotOptions: DS.attr('string'),

  isRaw: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.type') === AGGREGATIONS.get('RAW');
  }),

  isReallyRaw: Ember.computed('isRaw', 'querySnapshot', function() {
    return this.get('isRaw') && this.get('querySnapshot.projectionsSize') === 0;
  }),

  isCountDistinct: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.type') === AGGREGATIONS.get('COUNT_DISTINCT');
  }),

  isGroupAll: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.type') === AGGREGATIONS.get('GROUP') && this.get('querySnapshot.groupsSize') === 0;
  }),

  isGroupBy: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.metricsSize') >= 1 && this.get('querySnapshot.groupsSize') >= 1;
  }),

  isDistribution: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.type') === AGGREGATIONS.get('DISTRIBUTION');
  }),

  isTopK: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.type') === AGGREGATIONS.get('TOP_K');
  }),

  isSingleRow: Ember.computed.or('isCountDistinct', 'isGroupAll')
});

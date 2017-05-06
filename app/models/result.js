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

  isReallyRaw: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.type') === AGGREGATIONS.get('RAW') && this.get('querySnapshot.projectionSize') === 0;
  }),

  isDistribution: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.type') === AGGREGATIONS.get('DISTRIBUTION');
  }),

  isTopK: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.type') === AGGREGATIONS.get('TOP_K');
  }),


  isGroupBy: Ember.computed('querySnapshot', function() {
    return this.get('querySnapshot.metricsSize') >= 1 && this.get('querySnapshot.groupsSize') >= 1;
  }),

  isChartable: Ember.computed.or('isDistribution', 'isGroupBy', 'isTopK')
});

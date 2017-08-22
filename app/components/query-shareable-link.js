/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['query-shareable-link'],
  row: null,

  queryLink: Ember.computed.alias('row.queryLink').readOnly(),

  queryID: Ember.computed('row.content.id', function() {
    return `query-${this.get('row.content.id')}`;
  }).readOnly(),

  queryIDSelector: Ember.computed('queryID', function() {
    return `#${this.get('queryID')}`;
  }).readOnly(),

  actions: {
    collapse() {
      this.set('row.expanded', false);
    }
  }
});

/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['query-shareable-link'],
  row: null,

  queryLink: alias('row.queryLink').readOnly(),

  queryID: computed('row.content.id', function() {
    return `query-${this.get('row.content.id')}`;
  }).readOnly(),

  queryIDSelector: computed('queryID', function() {
    return `#${this.get('queryID')}`;
  }).readOnly(),

  actions: {
    collapse() {
      this.set('row.expanded', false);
    }
  }
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['query-name-entry'],
  tagName: 'div',
  hasHover: false,

  isUnsaved: Ember.computed('row', function() {
    let query = this.get('row.content');
    if (query.get('hasDirtyAttributes') || query.get('hasUnsavedFields')) {
      return Ember.RSVP.resolve(true);
    }
    return query.validate().then(hash => !hash.validations.get('isValid'));
  }),

  click() {
    this.get('tableActions.queryClick')(this.get('row'));
  },

  mouseEnter() {
    this.set('hasHover', true);
  },

  mouseLeave() {
    this.set('hasHover', false);
  },

  actions: {
    editClick() {
      this.get('tableActions.queryClick')(this.get('row'));
    },

    copyClick() {
      this.get('tableActions.copyQueryClick')(this.get('row'));
    },

    linkClick() {
      this.get('tableActions.linkQueryClick')(this.get('row'));
    },

    deleteClick() {
      this.get('tableActions.deleteQueryClick')(this.get('row'));
    }
  }
});

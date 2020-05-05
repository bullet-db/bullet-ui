/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { resolve } from 'rsvp';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['query-name-entry'],
  tagName: 'div',
  hasHover: false,

  isUnsaved: computed('row', function() {
    let query = this.get('row.content');
    if (query.get('hasDirtyAttributes') || query.get('hasUnsavedFields')) {
      return resolve(true);
    }
    return query.validate().then(hash => !hash.validations.get('isValid'));
  }),

  click() {
    this.get('tableActions.queryClick')(this.row);
  },

  mouseEnter() {
    this.set('hasHover', true);
  },

  mouseLeave() {
    this.set('hasHover', false);
  },

  actions: {
    editClick() {
      this.get('tableActions.queryClick')(this.row);
    },

    copyClick() {
      this.get('tableActions.copyQueryClick')(this.row);
    },

    linkClick() {
      this.get('tableActions.linkQueryClick')(this.row);
    },

    deleteClick() {
      this.get('tableActions.deleteQueryClick')(this.row);
    }
  }
});

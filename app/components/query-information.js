/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
  querier: service(),
  query: null,
  querySnapshot: null,

  isRunningQuery: alias('querier.isRunningQuery').readOnly(),

  actions: {
    cancelClick() {
      this.sendAction('cancelClick');
    },

    reRunClick(query) {
      this.sendAction('reRunClick', query);
    },

    queryClick(query) {
      this.sendAction('queryClick', query);
    }
  }
});

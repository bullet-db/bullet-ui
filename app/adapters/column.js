/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { computed } from '@ember/object';
import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  host: computed('settings', function() {
    return this.get('settings.schemaHost');
  }),

  namespace: computed('settings', function() {
    return this.get('settings.schemaNamespace');
  }),

  ajaxOptions() {
    let hash = this._super(...arguments);
    hash.crossDomain = true;
    hash.xhrFields = { withCredentials: true };
    return hash;
  },

  shouldBackgroundReloadAll() {
    // Force the columns to be fetched only once per "session"
    return false;
  }
});

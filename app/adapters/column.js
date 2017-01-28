/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  host: Ember.computed('settings', function() {
    return this.get('settings.schemaHost');
  }),

  namespace: Ember.computed('settings', function() {
    return this.get('settings.schemaNamespace');
  }),

  shouldBackgroundReloadAll() {
    // Force the columns to be fetched only once per "session"
    return false;
  }
});


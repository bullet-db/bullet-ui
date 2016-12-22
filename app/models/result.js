/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  metadata: DS.attr({ defaultValue() {
     return Ember.Object.create();
   } }),
  records: DS.attr({ defaultValue() {
    return Ember.A();
  } }),
  created: DS.attr('date', { defaultValue() {
    return new Date(Date.now());
  } }),
  query: DS.belongsTo('query', { autoSave: true })
});

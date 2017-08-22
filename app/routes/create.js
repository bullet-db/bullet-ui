/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  queryManager: Ember.inject.service(),

  serialize(model) {
    return { hash: model.get('hash') };
  },

  model(params) {
    let hash = params.hash;
    let manager = this.get('queryManager');
    return manager.decodeQuery(hash).then(object => manager.copyQuery(object));
  },

  afterModel(model) {
    this.transitionTo('query', model.get('id'));
  }
});

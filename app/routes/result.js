/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('result', params.result_id).catch(() => {
      return this.transitionTo('missing', 'not-found');
    });
  },
  // Force the fetching of query and filter
  afterModel(model) {
    return Ember.RSVP.hash({
      metadata: model.get('metadata'),
      records: model.get('records'),
      query: model.get('query'),
      filter: model.get('query').then(query => query.get('filter'))
    });
  },

  actions: {
    queryClick(query) {
      this.transitionTo('query', query.get('id'));
    }
  }
});

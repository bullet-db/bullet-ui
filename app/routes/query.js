/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  querier: Ember.inject.service(),
  queryManager: Ember.inject.service(),

  resultHandler(data, context) {
    context.set('pendingRequest', null);
    context.get('queryManager').addResult(context.paramsFor('query').query_id, data).then(result => {
      context.transitionTo('result', result.get('id'));
    });
  },

  errorHandler(error, context) {
    context.set('pendingRequest', null);
    Ember.Logger.error(error);
    context.transitionTo('errored');
  },

  actions: {
    willTransition() {
      this.send('cancelQuery');
      return true;
    },

    cancelQuery() {
      let pendingRequest = this.get('pendingRequest');
      if (pendingRequest) {
        pendingRequest.abort();
      }
    },

    fireQuery() {
      this.store.findRecord('query', this.paramsFor('query').query_id).then((query) => {
        let request = this.get('querier').send(query, this.resultHandler, this.errorHandler, this);
        // The low level XMLHTTPRequest
        this.set('pendingRequest', request);
      });
    }
  },

  model(params) {
    return Ember.RSVP.hash({
      schema: this.store.findAll('column'),
      query: this.store.findRecord('query', params.query_id)
    }).catch(() => {
      // Needed since findRecord adds the non-existant record to the cache
      this.store.unloadAll('query');
      return this.transitionTo('errored');
    });
  },

  // Force the fetching of filter because template doesn't render it since it's wrapped in QueryBuilder
  afterModel(model) {
    return Ember.RSVP.hash({
      schema: Ember.RSVP.resolve(model.schema),
      query: Ember.RSVP.resolve(model.query),
      filter: model.query.get('filter')
    });
  }
});

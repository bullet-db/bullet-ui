/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { hash, resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  querier: service(),
  queryManager: service(),

  resultHandler(data, context) {
    context.set('pendingRequest', null);
    context.get('queryManager').addResult(context.paramsFor('query').query_id, data).then(result => {
      context.transitionTo('result', result.get('id'));
    });
  },

  errorHandler(error, context) {
    context.set('pendingRequest', null);
    console.error(error);
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
        pendingRequest.disconnect();
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
    return hash({
      schema: this.store.findAll('column'),
      query: this.store.findRecord('query', params.query_id)
    }).catch(() => {
      // Needed since findRecord adds the non-existant record to the cache
      this.store.unloadAll('query');
      this.transitionTo('errored');
    });
  },

  // Force the fetching of filter because template doesn't render it since it's wrapped in QueryBuilder
  afterModel(model) {
    return hash({
      schema: resolve(model.schema),
      query: resolve(model.query),
      filter: model.query.get('filter')
    });
  }
});

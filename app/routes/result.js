/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  querier: service(),

  model(params) {
    return this.store.findRecord('result', params.result_id).catch(() => {
      this.transitionTo('missing', 'not-found');
    });
  },

  afterModel(model) {
    // Fetch all the things
    return hash({
      query: model.get('query'),
      filter: model.get('query').then(query => query.get('filter'))
    });
  },

  actions: {
    queryClick(query) {
      this.transitionTo('query', query.get('id'));
    },

    willTransition() {
      this.get('querier').cancel();
      return true;
    }
  }
});

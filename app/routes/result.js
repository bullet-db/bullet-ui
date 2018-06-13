/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Queryable from 'bullet-ui/mixins/queryable';

export default Route.extend(Queryable, {
  querier: service(),
  queryManager: service(),

  model(params) {
    return this.store.findRecord('result', params.result_id).catch(() => {
      this.transitionTo('missing', 'not-found');
    });
  },

  afterModel(model) {
    // Fetch all the things
    return model.get('query').then(query => {
      return hash({
        filter: query.get('filter'),
        projections: query.get('projections'),
        aggregation: query.get('aggregation').then(aggregation => {
          return hash({ groups: aggregation.get('groups'), metrics: aggregation.get('metrics') });
        }),
        window: query.get('window')
      });
    })
  },

  actions: {
    queryClick(query) {
      this.transitionTo('query', query.get('id'));
    },

    reRunClick(query) {
      this.get('queryManager').addResult(query.get('id')).then(result => {
        this.get('querier').cancel();
        // Sends us to a new result page but don't want to cancel the new query when we transition.
        this.set('skipCancelling', true);
        this.submitQuery(query, result, this)
      });
    },

    cancelClick() {
      this.get('querier').cancel();
    },

    willTransition() {
      if (this.get('skipCancelling')) {
        // Reset so future queries don't skip cancelling.
        this.set('skipCancelling', false);
      } else {
        this.get('querier').cancel();
      }
      return true;
    }
  }
});

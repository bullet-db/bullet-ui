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
        this.set('hasPendingSubmit', true);
        this.set('pendingQuery', query);
        this.set('savedResult', result);
        // Sends us to a new result page but don't want to start the new query till we finish transitioning.
        this.resultHandler(this);
      });
    },

    cancelClick() {
      this.get('querier').cancel();
    },

    willTransition() {
      this.get('querier').cancel();
      return true;
    },

    didTransition() {
      if (this.get('hasPendingSubmit')) {
        let pendingQuery = this.get('pendingQuery');
        this.lateSubmitQuery(pendingQuery, this);
        this.set('hasPendingSubmit', false);
        this.set('pendingQuery', null);
      }
      return true;
    }
  }
});

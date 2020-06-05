/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import QueryableRoute from 'bullet-ui/routes/queryable-route';

export default class ResultRoute extends QueryableRoute {
  @service querier;
  @service queryManager;
  @service store;

  model(params) {
    return this.store.findRecord('result', params.result_id).catch(() => {
      this.transitionTo('missing', 'not-found');
    });
  }

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
    });
  }

  @action
  queryClick(query) {
    this.transitionTo('query', query.get('id'));
  }

  @action
  reRunClick(query) {
    this.queryManager.addResult(query.get('id')).then(result => {
      this.hasPendingSubmit = true;
      this.pendingQuery = query;
      this.savedResult = result;
      // Sends us to a new result page but don't want to start the new query till we finish transitioning.
      this.resultHandler(this);
    });
  }

  @action
  cancelClick() {
    this.querier.cancel();
  }

  @action
  willTransition() {
    this.querier.cancel();
    return true;
  }

  @action
  didTransition() {
    if (this.hasPendingSubmit) {
      let pendingQuery = this.pendingQuery;
      this.lateSubmitQuery(pendingQuery, this);
      this.hasPendingSubmit =  false;
      this.pendingQuery = null;
    }
    return true;
  }
}

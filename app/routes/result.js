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

  async model(params) {
    try {
      let result = await this.store.findRecord('result', params.result_id);
      // Fetch all the things
      let query = await result.query;
      let filter = await query.filter;
      let projections = await query.projections;
      let aggregation = await query.aggregation;
      let groups = await aggregation.groups;
      let metrics = await aggregation.metrics;
      let window = await query.window;
      return result;
    } catch(error) {
      this.transitionTo('missing', 'not-found');
    }
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

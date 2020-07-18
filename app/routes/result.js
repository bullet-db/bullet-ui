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
      let query = await result.query;
      // Fetch all the things
      await query.filter;
      await query.projections;
      await query.window;
      let aggregation = await query.aggregation;
      await aggregation.groups;
      await aggregation.metrics;
      return { result, query };
    } catch(error) {
      this.transitionTo('missing', 'not-found');
    }
  }

  @action
  queryClick() {
    let query = this.controller.get('model.query');
    this.transitionTo('query', query.get('id'));
  }

  @action
  async reRunClick() {
    let query = this.controller.get('model.query');
    let result = await this.queryManager.addResult(query.get('id'));
    this.hasPendingSubmit = true;
    this.savedResult = result;
    // Sends us to a new result page but don't want to start the new query till we finish transitioning.
    this.resultHandler(this);
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
      let pendingQuery = this.controller.get('model.query');
      this.lateSubmitQuery(pendingQuery, this);
      this.hasPendingSubmit =  false;
      this.pendingQuery = null;
    }
    return true;
  }
}

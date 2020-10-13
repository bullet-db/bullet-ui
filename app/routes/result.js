/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { getRouteFor } from 'bullet-ui/utils/query-type';

export default class ResultRoute extends Route {
  @service querier;
  @service queryManager;
  @service store;

  async model(params) {
    let result = await this.store.findRecord('result', params.result_id);
    let query = await result.query;
    return { result, query };
  }

  async findQuery() {
    let query = this.controller.get('model.query');
    // If there is a builder query associated, use that
    let queries = await this.store.findAll('query');
    let optional = queries.findBy('bql.id', query.get('id'));
    return optional ? optional : query;
  }

  lateSubmitQuery(query) {
    let handlers = {
      success() {
      },
      error(error, route) {
        console.error(error); // eslint-disable-line no-console
        route.transitionTo('errored');
      },
      message(message, route) {
        route.queryManager.addSegment(route.controller.get('model.result'), message);
      }
    };
    this.querier.send(query, handlers, this);
  }

  @action
  async queryClick() {
    let query = await this.findQuery();
    this.transitionTo(getRouteFor(query), query.get('id'));
  }

  @action
  async reRunClick() {
    let controller = this.controller;
    let query = controller.get('model.query');
    let result = await this.queryManager.addResult(query.get('id'));
    controller.hasPendingSubmit = true;
    // Sends us to a new result page but don't want to start the new query till we finish transitioning.
    this.transitionTo('result', result.get('id'));
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
    let controller = this.controller;
    if (controller.hasPendingSubmit) {
      let bql = controller.get('model.query');
      this.lateSubmitQuery(bql.query);
      controller.hasPendingSubmit = false;
    }
    return true;
  }

  @action
  error() {
    this.replaceWith('missing', 'not-found');
  }
}

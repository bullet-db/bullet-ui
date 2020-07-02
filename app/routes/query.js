/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import QueryableRoute from 'bullet-ui/routes/queryable-route';

export default class QueryRoute extends QueryableRoute {
  @service querier;
  @service queryManager;
  @service store;

  async model(params) {
    let schema = await this.store.findAll('column');
    let query = await this.store.findRecord('query', params.query_id);
    let filter = await query.filter;
    let projections = await query.projections;
    let window = await query.window;
    let aggregation = await query.aggregation;
    let groups = await aggregation.groups;
    let metrics = await aggregation.metrics;
    return { schema, query, filter, projections, window, aggregation, groups, metrics };
  }

  @action
  fireQuery() {
    this.queryManager.addResult(this.paramsFor('query').query_id).then(result => {
      this.store.findRecord('query', this.paramsFor('query').query_id).then(query => {
        this.submitQuery(query, result, this);
      });
    });
  }
}

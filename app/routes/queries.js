/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject, { action } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { getRouteFor } from 'bullet-ui/utils/query-type';
import { getOrigin } from 'bullet-ui/utils/page-origin';

export default class QueriesRoute extends Route {
  @service queryManager;
  @service router;

  async findQueries() {
    let queries = await this.store.findAll('query');
    let bqls = await this.store.findAll('bql');
    let all = A(queries.toArray());
    // Dedup the true bqls
    let map = new Map();
    bqls.forEach(bql => map.set(bql.get('id'), bql));
    queries.forEach(query => map.delete(query.get('bql.id')));
    map.forEach(bql => all.pushObject(bql));
    return all;
  }

  async model() {
    let queries = await this.findQueries();
    let filters = await this.store.findAll('filter');
    let results = await this.store.findAll('result');
    let groups = await this.store.findAll('group');
    let aggregations = await this.store.findAll('aggregation');
    let projections = await this.store.findAll('projection');
    let metrics = await this.store.findAll('metric');
    let windows = await this.store.findAll('window');
    return { queries, filters, results, groups, aggregations, projections, metrics, windows };
  }

  afterModel(model) {
    /*
      This exists to cleanup any models that were created for the query form but not saved. No need to do results,
      query or aggregation since they are not copied. No need to hold up anything while this is happening. These
      happen when the user doesn't save. We can handle it by discarding when the user transitions away without saving,
      but even then cases of unsaved models where the user just closes the browser or types in a new url will need to
      be handled. So, might as well handle it all here. This isn't blocking the queries load.
    */
    this.queryManager.deleteAllUnparented(model);
  }

  @action
  queryClick(query) {
    return this.transitionTo(getRouteFor(query), query.get('id'));
  }

  @action
  async copyQueryClick(query, callback) {
    let copy = await this.queryManager.copy(query);
    callback(copy);
  }

  @action
  async linkQueryClick(query, callback) {
    let encoded = await this.queryManager.encode(query);
    let origin = getOrigin();
    let path = this.router.urlFor('create', EmberObject.create({ hash: encoded }));
    callback(`${origin}${path}`);
  }

  @action
  resultClick(result) {
    this.transitionTo('result', result.get('id'));
  }

  @action
  deleteResultsClick(query) {
    this.queryManager.deleteResults(query);
  }

  @action
  deleteQueryClick(query) {
    this.queryManager.delete(query);
  }
}

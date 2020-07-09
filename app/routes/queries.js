/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject, { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { isNone } from '@ember/utils';

export default class QueriesRoute extends Route {
  @service queryManager;
  @service router;

  async model() {
    let queries = await this.store.findAll('query');
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
    // This exists to cleanup any copy models that were created for the query form but not discarded. This can happen if
    // the router transition does not fire for some reason (bookmark, close browser etc.) No need to do results, query
    // or aggregation since they are not copied. Also don't care about holding up anything while this is happening.
    this.reapUnparented(model.filters, 'query');
    this.reapUnparented(model.windows, 'query');
    this.reapUnparented(model.projections, 'query');
    this.reapUnparented(model.groups, 'aggregation');
    this.reapUnparented(model.metrics, 'aggregation');
  }

  reapUnparented(collection, parentName) {
    if (isNone(collection)) {
      return;
    }
    collection.forEach(item => {
      item.get(parentName).then(parent => {
        if (isNone(parent)) {
          this.queryManager.deleteModel(item);
        }
      });
    });
  }

  getOrigin() {
    let { protocol, hostname, port } = window.location;
    port = port ? `:${port}` : '';
    return `${protocol}//${hostname}${port}`;
  }

  @action
  queryClick(query) {
    // Force the model hook to fire in query. This is needed since that uses a RSVP hash.
    this.transitionTo('query', query.get('id'));
  }

  @action
  copyQueryClick(query, callback) {
    this.queryManager.copyQuery(query).then(copy => callback(copy));
  }

  @action
  linkQueryClick(query, callback) {
    this.queryManager.encodeQuery(query).then(encoded => {
      let origin = this.getOrigin();
      let path = this.router.urlFor('create', EmberObject.create({ hash: encoded }));
      callback(`${origin}${path}`);
    });
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
    this.queryManager.deleteQuery(query);
  }
}

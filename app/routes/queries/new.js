/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { typeOf } from '@ember/utils';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import isEmpty from 'bullet-ui/utils/is-empty';
import { EMPTY_CLAUSE } from 'bullet-ui/utils/filterizer';

export default class QueriesNewRoute extends Route {
  @service('cors-request') corsRequest;
  @service querier;
  @service queryManager;
  @service store;
  cachedQuery;

  beforeModel() {
    return this.addDefaultQuery().then(query => {
      query.save().then(() => {
        this.transitionTo('query', query.get('id'));
      });
    });
  }

  addDefaultQuery() {
    let fetchedQuery = this.cachedQuery;
    // If we already fetched and stored the default query, use that.
    if (fetchedQuery) {
      return this.createQuery(fetchedQuery);
    }

    let defaultQuery = get(this, 'settings.defaultQuery');
    // Create an empty query if we don't have defaults
    if (!defaultQuery) {
      return this.createEmptyQuery();
    }

    // If we have a default query in settings, use that.
    if (typeOf(defaultQuery) === 'object') {
      return this.createQuery(defaultQuery);
    }

    // Otherwise, assume defaultQuery is an url to get the default query from.
    return this.corsRequest.get(defaultQuery).then(query => {
      this.set('cachedQuery', query);
      return this.createQuery(query);
    });
  }

  createQuery(query) {
    if (!query) {
      return this.createEmptyQuery();
    }
    // If query does not have a filter, recreate will create it. No need to call createEmptyFilter
    // If query does not have an aggregation, we must create it.
    if (isEmpty(query.aggregation)) {
      query.aggregation = get(this, 'querier.defaultAPIAggregation');
    }
    let queryObject = this.querier.recreate(query);
    return this.queryManager.copyQuery(queryObject);
  }

  createEmptyFilter(query) {
    let empty = this.store.createRecord('filter', {
      clause: EMPTY_CLAUSE,
      query: query
    });
    return empty.save();
  }

  createEmptyQuery() {
    let aggregation = this.store.createRecord('aggregation', get(this, 'querier.defaultAggregation'));
    aggregation.save();
    let query = this.store.createRecord('query', {
      aggregation: aggregation
    });
    return this.createEmptyFilter(query).then(() => query);
  }
}

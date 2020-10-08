/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { typeOf } from '@ember/utils';
import Route from '@ember/routing/route';

/**
 * Users of this class must implement async createQuery(bql) and a async createDefaultQuery() methods.
 */
export default class DefaultQueryRoute extends Route {
  @service('cors-request') corsRequest;
  cachedQuery;

  async addDefaultQuery() {
    let fetchedQuery = this.cachedQuery;
    // If we already fetched and stored the default query, use that.
    if (fetchedQuery) {
      return this.createQuery(fetchedQuery);
    }

    let defaultQuery = get(this, 'settings.defaultQuery');
    // Create an empty query if we don't have defaults
    if (!defaultQuery || typeOf(defaultQuery) !== 'string') {
      return this.createEmptyQuery();
    }

    // If defaultQuery is an url to get the default query from, fetch it first
    let query = defaultQuery;
    if (defaultQuery.startsWith('http')) {
      query = await this.corsRequest.get(defaultQuery);
      this.set('cachedQuery', query);
    }
    // Now query is a default query (fetched from a url in settings or provided in settings)
    return this.createQuery(query);
  }
}

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { resolve } from 'rsvp';
import { isEmpty, typeOf } from '@ember/utils';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import Filterizer from 'bullet-ui/mixins/filterizer';
import { DEFAULT_API_AGGREGATION } from 'bullet-ui/services/querier';

export default Route.extend(Filterizer, {
  corsRequest: service(),
  querier: service(),
  queryManager: service(),

  beforeModel() {
    return this.addDefaultQuery().then(query => {
      query.save().then(() => {
        this.transitionTo('query', query.get('id'));
      });
    });
  },

  addDefaultQuery() {
    let fetchedQuery = this.get('cachedQuery');
    // If we already fetched and stored the default query, use that.
    if (fetchedQuery) {
      return this.createQuery(fetchedQuery);
    }

    let defaultQuery = this.get('settings.defaultQuery');
    // Create an empty query if we don't have defaults
    if (!defaultQuery) {
      return this.createEmptyQuery();
    }

    // If we have a default filter in settings, use that.
    if (typeOf(defaultQuery) === 'object') {
      return this.createQuery(defaultQuery);
    }

    // Otherwise, assume defaultQuery is an url to get the default query from.
    return this.get('corsRequest').request(defaultQuery).then(query => {
      this.set('cachedQuery', query);
      return this.createQuery(query);
    });
  },

  createQuery(query) {
    if (!query) {
      return this.createEmptyQuery();
    }
    // If query does not have a filter, recreate will create it. No need to call createEmptyFilter
    // If query does not have an aggregation, we must create it.
    if (isEmpty(query.aggregation)) {
      query.aggregation = DEFAULT_API_AGGREGATION;
    }
    let queryObject = this.get('querier').recreate(query);
    return this.get('queryManager').copyQuery(queryObject);
  },

  createEmptyFilter(query) {
    let empty = this.store.createRecord('filter', {
      clause: this.get('emptyClause'),
      query: query
    });
    return empty.save();
  },

  createEmptyQuery() {
    let aggregation = this.store.createRecord('aggregation');
    aggregation.save();
    let query = this.store.createRecord('query', {
      aggregation: aggregation
    });
    return this.createEmptyFilter(query).then(() => query);
  }
});

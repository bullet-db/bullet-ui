/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { hash, resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import Queryable from 'bullet-ui/mixins/queryable';

export default Route.extend(Queryable, {
  querier: service(),
  queryManager: service(),

  actions: {
    fireQuery() {
      this.get('queryManager').addResult(this.paramsFor('query').query_id).then(result => {
        this.store.findRecord('query', this.paramsFor('query').query_id).then(query => {
          this.submitQuery(query, result, this);
        });
      });
    }
  },

  model(params) {
    return hash({
      schema: this.store.findAll('column'),
      query: this.store.findRecord('query', params.query_id)
    }).catch(() => {
      // Needed since findRecord adds the non-existant record to the cache
      this.store.unloadAll('query');
      this.transitionTo('errored');
    });
  },

  // Force the fetching of filter because template doesn't render it since it's wrapped in QueryBuilder
  afterModel(model) {
    return hash({
      schema: resolve(model.schema),
      query: resolve(model.query),
      filter: model.query.get('filter')
    });
  }
});

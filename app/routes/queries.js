/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { hash, reject, resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  queryManager: service(),

  model() {
    return hash({
      queries: this.store.findAll('query'),
      groups: this.store.findAll('group'),
      aggregations: this.store.findAll('aggregation'),
      projections: this.store.findAll('projection'),
      metrics: this.store.findAll('metric')
    });
  },

  validate(query) {
    return query.validate().then(hash => {
      if (!hash.validations.get('isValid')) {
        return reject();
      }
      return resolve(query);
    });
  },

  getOrigin() {
    let { protocol, hostname, port } = window.location;
    port = port ? `:${port}` : '';
    return `${protocol}//${hostname}${port}`;
  },

  actions: {
    queryClick(query) {
      // Force the model hook to fire in query. This is needed since that uses a RSVP hash.
      this.transitionTo('query', query.get('id'));
    },

    copyQueryClick(query, callback) {
      this.validate(query).then(query => this.get('queryManager').copyQuery(query)).then(copy => callback(copy));
    },

    linkQueryClick(query, callback) {
      this.validate(query)
        .then((query) => this.get('queryManager').encodeQuery(query))
        .then((encoded) => {
          let origin = this.getOrigin();
          let path = this.router.generate('create', EmberObject.create({ hash: encoded }));
          callback(`${origin}${path}`);
        });
    },

    resultClick(result) {
      this.transitionTo('result', result.get('id'));
    },

    deleteResultsClick(query) {
      this.get('queryManager').deleteResults(query);
    },

    deleteQueryClick(query) {
      this.get('queryManager').deleteQuery(query);
    }
  }
});

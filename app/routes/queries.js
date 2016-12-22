/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.RSVP.hash({
      queries: this.store.findAll('query'),
      filters: this.store.findAll('filter'),
      projections: this.store.findAll('projection'),
      results: this.store.findAll('result')
    });
  },

  copy(from, to, fields, query) {
    fields.forEach(field => {
      to.set(field, from.get(field));
    });
    to.set('query', query);
    return to.save();
  },

  copySingle(source, target, name, fields) {
    let from = source.get(name);
    if (Ember.isEmpty(from)) {
      return Ember.RSVP.resolve();
    }
    let to = this.store.createRecord(name);
    return this.copy(from, to, fields, target);
  },

  copyMultiple(source, target, name, fields) {
    let all = source.get(Ember.Inflector.inflector.pluralize(name));
    if (Ember.isEmpty(all)) {
      return Ember.RSVP.resolve();
    }
    let promises = [];
    all.forEach(from => {
      let to = this.store.createRecord(name);
      promises.push(this.copy(from, to, fields, target));
    });
    return Ember.RSVP.all(promises);
  },

  deleteSingle(name, query) {
    query.get(name).then(item => {
      item.set('query', null);
      item.destroyRecord();
    });
  },

  deleteMultiple(name, query) {
    query.get(name).then(items => {
      items.toArray().forEach(item => {
        items.removeObject(item);
        item.destroyRecord();
      });
    });
  },

  actions: {
    queryClick(query) {
      // Force the model hook to fire in query. This is needed since that uses a RSVP hash.
      this.transitionTo('query', query.get('id'));
    },

    copyQueryClick(query, callback) {
      query.validate().then((hash) => {
        if (!hash.validations.get('isValid')) {
          return;
        }
        let copied = this.store.createRecord('query', {
          name: query.get('name'),
          duration: query.get('duration')
        });
        // All prefetched
        let promises = [
          this.copySingle(query, copied, 'filter', ['clause', 'summary']),
          this.copySingle(query, copied, 'aggregation', ['type', 'size']),
          this.copyMultiple(query, copied, 'projection', ['field', 'name'])
        ];
        Ember.RSVP.all(promises).then(() => {
          copied.save().then(() => {
            callback(copied);
          });
        });
      });
    },

    resultClick(result) {
      this.transitionTo('result', result.get('id'));
    },

    deleteResultsClick(query) {
      this.deleteMultiple('results', query);
      query.save();
    },

    deleteQueryClick(query) {
      this.deleteSingle('filter', query);
      this.deleteSingle('aggregation', query);
      this.deleteMultiple('projections', query);
      this.deleteMultiple('results', query);
      query.destroyRecord();
    }
  }
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  copyModelRelationship(from, to, fields, inverseName, inverseValue) {
    fields.forEach(field => {
      to.set(field, from.get(field));
    });
    to.set(inverseName, inverseValue);
    return to.save();
  },

  copySingle(source, target, name, inverseName, fields) {
    let original = source.get(name);
    if (Ember.isEmpty(original)) {
      return Ember.RSVP.resolve();
    }
    let copy = this.get('store').createRecord(name);
    return this.copyModelRelationship(original, copy, fields, inverseName, target);
  },

  copyMultiple(source, target, name, inverseName, fields) {
    let originals = source.get(Ember.Inflector.inflector.pluralize(name));
    if (Ember.isEmpty(originals)) {
      return Ember.RSVP.resolve();
    }
    let promises = [];
    originals.forEach(original => {
      let copy = this.get('store').createRecord(name);
      promises.push(this.copyModelRelationship(original, copy, fields, inverseName, target));
    });
    return Ember.RSVP.all(promises);
  },

  copyQuery(query) {
    let copied = this.get('store').createRecord('query', {
      name: query.get('name'),
      duration: query.get('duration')
    });
    // Assume prefetched
    let promises = [
      this.copySingle(query, copied, 'filter', 'query', ['clause', 'summary']),
      this.copySingle(query, copied, 'aggregation', 'query', ['type', 'size']),
      this.copyMultiple(query, copied, 'projection', 'query', ['field', 'name'])
    ];

    return Ember.RSVP.all(promises).then(() => {
      let originalAggregation = query.get('aggregation');
      let copiedAggregation = copied.get('aggregation');
      return Ember.RSVP.all([
        this.copyMultiple(originalAggregation, copiedAggregation, 'group', 'aggregation', ['field', 'name']),
        this.copyMultiple(originalAggregation, copiedAggregation, 'metric', 'aggregation', ['type', 'field', 'name'])
      ]);
    }).then(() => copied.save()).then(() => copied);
  },

  addFieldLike(childModelName, modelFieldName, model) {
    // Autosave takes care of updating parent model
    let opts = {};
    opts[modelFieldName] = model;
    let childModel = this.get('store').createRecord(childModelName, opts);
    return childModel.save();
  },

  addAttributeIfNotEmpty(query, fieldName, value) {
    return query.get('aggregation').then(aggregation => {
      let fieldPath = `attributes.${fieldName}`;
      if (Ember.isEmpty(aggregation.get(fieldPath))) {
        aggregation.set(fieldPath, value);
        return aggregation.save();
      }
      return Ember.RSVP.resolve();
    });
  },

  replaceAggregation(query, type, size = 1) {
    return query.get('aggregation').then(aggregation => {
      return Ember.RSVP.all([
        this.deleteMultiple('groups', aggregation, 'aggregation'),
        this.deleteMultiple('metrics', aggregation, 'aggregation')
      ]).then(() => {
        aggregation.set('type', type);
        aggregation.set('size', size);
        return aggregation.save();
      });
    });
  },

  save(query, clause, summary) {
    // The underlying relationship saving need not block query saving
    let promises = [
      query.get('filter').then(i => {
        i.set('clause', clause);
        i.set('summary', summary);
        i.save();
      }),
      query.get('projections').then(p => p.forEach(i => i.save())),
      query.get('aggregation').then(a => {
        let promises = [
              a.get('groups').then(g => g.forEach(i => i.save())),
              a.get('metrics').then(m => m.forEach(i => i.save())),
              a.save()
            ];
        return Ember.RSVP.all(promises);
      }),
      query.save()
    ];
    return Ember.RSVP.all(promises);
  },

  deleteModel(model) {
    // Autosave takes care of updating parent
    model.destroyRecord();
  },

  deleteSingle(name, model, inverseName) {
    return model.get(name).then(item => {
      item.set(inverseName, null);
      item.destroyRecord();
    });
  },

  deleteMultiple(name, model, inverseName) {
    return model.get(name).then(items => {
      items.toArray().forEach(item => {
        items.removeObject(item);
        item.set(inverseName, null);
        item.destroyRecord();
      });
    });
  },

  deleteProjections(query) {
    return query.get('projections').then((p) => {
      p.forEach(i => i.destroyRecord());
    });
  },

  deleteAggregation(query) {
    return query.get('aggregation').then(aggregation => {
      this.deleteMultiple('groups', aggregation, 'aggregation');
      this.deleteMultiple('metrics', aggregation, 'aggregation');
      aggregation.set('query', null);
      return aggregation.destroyRecord();
    });
  },

  deleteResults(query) {
    this.deleteMultiple('results', query, 'query');
    query.save();
  },

  deleteQuery(query) {
    this.deleteSingle('filter', query, 'query');
    this.deleteMultiple('projections', query, 'query');
    this.deleteMultiple('results', query, 'query');
    this.deleteAggregation(query);
    query.destroyRecord();
  }
});

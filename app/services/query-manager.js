/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { isBlank, isEmpty, isEqual } from '@ember/utils';
import { AGGREGATIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
import { pluralize } from 'ember-inflector';
import ZLib from 'npm:browserify-zlib';
import Base64 from 'npm:urlsafe-base64';
import { all, Promise, resolve } from 'rsvp';

export default Service.extend({
  store: service(),
  querier: service(),

  copyModelRelationship(from, to, fields, inverseName, inverseValue) {
    fields.forEach(field => {
      to.set(field, from.get(field));
    });
    to.set(inverseName, inverseValue);
    return to.save();
  },

  copySingle(source, target, name, inverseName, fields) {
    let original = source.get(name);
    if (isEmpty(original)) {
      return resolve();
    }
    let copy = this.get('store').createRecord(name);
    return this.copyModelRelationship(original, copy, fields, inverseName, target);
  },

  copyMultiple(source, target, name, inverseName, fields) {
    let originals = source.get(pluralize(name));
    if (isEmpty(originals)) {
      return resolve();
    }
    let promises = [];
    originals.forEach(original => {
      let copy = this.get('store').createRecord(name);
      promises.push(this.copyModelRelationship(original, copy, fields, inverseName, target));
    });
    return all(promises);
  },

  copyQuery(query) {
    let copied = this.get('store').createRecord('query', {
      name: query.get('name'),
      duration: query.get('duration')
    });
    // Assume prefetched
    let promises = [
      this.copySingle(query, copied, 'filter', 'query', ['clause', 'summary']),
      this.copySingle(query, copied, 'aggregation', 'query', ['type', 'size', 'attributes']),
      this.copyMultiple(query, copied, 'projection', 'query', ['field', 'name'])
    ];

    return all(promises).then(() => {
      let originalAggregation = query.get('aggregation');
      let copiedAggregation = copied.get('aggregation');
      return all([
        this.copyMultiple(originalAggregation, copiedAggregation, 'group', 'aggregation', ['field', 'name']),
        this.copyMultiple(originalAggregation, copiedAggregation, 'metric', 'aggregation', ['type', 'field', 'name'])
      ]);
    }).then(() => copied.save()).then(() => copied);
  },

  encodeQuery(query) {
    let querier = this.get('querier');
    querier.set('apiMode', false);
    let json = querier.reformat(query);
    querier.set('apiMode', true);
    let string = JSON.stringify(json);
    return new Promise((resolve) => {
      ZLib.deflate(string, (_, result) => resolve(Base64.encode(result)));
    });
  },

  decodeQuery(hash) {
    let querier = this.get('querier');
    let buffer = Base64.decode(hash);
    return new Promise((resolve) => {
      ZLib.inflate(buffer, (_, result) => {
        let json = JSON.parse(result.toString());
        resolve(querier.recreate(json));
      });
    });
  },

  addFieldLike(childModelName, modelFieldName, model) {
    // Autosave takes care of updating parent model
    let opts = {};
    opts[modelFieldName] = model;
    let childModel = this.get('store').createRecord(childModelName, opts);
    return childModel.save();
  },

  addResult(id, data) {
    return this.get('store').findRecord('query', id).then((query) => {
      let result = this.get('store').createRecord('result', {
        metadata: data.meta,
        records: data.records,
        querySnapshot: {
          type: query.get('aggregation.type'),
          groupsSize: query.get('aggregation.groups.length'),
          metricsSize: query.get('aggregation.metrics.length'),
          projectionsSize: query.get('projections.length'),
          fieldsSummary: query.get('fieldsSummary'),
          filterSummary: query.get('filterSummary')
        },
        query: query
      });
      query.set('lastRun', result.get('created'));
      return query.save().then(() => {
        return result.save();
      });
    });
  },

  setAggregationAttributes(query, fields) {
    return query.get('aggregation').then(aggregation => {
      fields.forEach(field => {
        let name = field.get('name');
        let value = field.get('value');
        let fieldPath = `attributes.${name}`;
        let forceSet = field.getWithDefault('forceSet', false);
        if (forceSet || isEmpty(aggregation.get(fieldPath))) {
          aggregation.set(fieldPath, value);
        }
      });
      return aggregation.save();
    });
  },

  replaceAggregation(query, type, size = 1) {
    return query.get('aggregation').then(aggregation => {
      return all([
        this.deleteMultiple('groups', aggregation, 'aggregation'),
        this.deleteMultiple('metrics', aggregation, 'aggregation')
      ]).then(() => {
        aggregation.set('type', type);
        aggregation.set('size', size);
        aggregation.set('attributes', EmberObject.create());
        return aggregation.save();
      });
    });
  },

  fixFieldLikes(query, fieldLikesPath) {
    return query.get(fieldLikesPath).then(e => {
      e.forEach(i => {
        if (isBlank(i.get('name'))) {
          i.set('name', i.get('field'));
        }
      });
      return resolve();
    });
  },

  removeAttributes(aggregation, ...fields) {
    fields.forEach(field => {
      aggregation.set(`attributes.${field}`, undefined);
    });
  },

  fixAggregationSize(query) {
    return query.get('aggregation').then(a => {
      let type = a.get('type');
      if (!(isEqual(type, AGGREGATIONS.get('RAW')) || isEqual(type, AGGREGATIONS.get('TOP_K')))) {
        query.set('aggregation.size', this.get('settings.defaultValues.aggregationMaxSize'));
      }
      return resolve();
    });
  },

  autoFill(query) {
    return all([
      this.fixFieldLikes(query, 'projections'),
      this.fixFieldLikes(query, 'aggregation.groups')
    ]);
  },

  fixDistributionPointType(query) {
    return query.get('aggregation').then(aggregation => {
      let pointType = aggregation.get('attributes.pointType');
      if (isEqual(pointType, DISTRIBUTION_POINTS.GENERATED)) {
        this.removeAttributes(aggregation, 'numberOfPoints', 'points');
      } else if (isEqual(pointType, DISTRIBUTION_POINTS.NUMBER)) {
        this.removeAttributes(aggregation, 'start', 'end', 'increment', 'points');
      } else {
        this.removeAttributes(aggregation, 'start', 'end', 'increment', 'numberOfPoints');
      }
      return resolve();
    });
  },

  cleanup(query) {
    return all([
      this.autoFill(query),
      this.fixAggregationSize(query),
      this.fixDistributionPointType(query)
    ]);
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
        return all(promises);
      }),
      query.save()
    ];
    return all(promises);
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
      let promises = items.toArray().map(item => {
        items.removeObject(item);
        item.set(inverseName, null);
        item.destroyRecord();
      });
      return all(promises);
    });
  },

  deleteProjections(query) {
    return query.get('projections').then((p) => {
      let promises = p.toArray().map(item => {
        item.destroyRecord();
      });
      return all(promises);
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
    this.deleteMultiple('results', query, 'query').then(() => {
      query.save();
    });
  },

  deleteQuery(query) {
    return all([
      this.deleteSingle('filter', query, 'query'),
      this.deleteMultiple('projections', query, 'query'),
      this.deleteMultiple('results', query, 'query'),
      this.deleteAggregation(query)
    ]).then(() => {
      query.destroyRecord();
    });
  },

  deleteAllResults() {
    return this.get('store').findAll('query').then(queries => {
      queries.forEach(q => this.deleteResults(q));
    });
  }
});

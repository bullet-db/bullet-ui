/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty } from '@ember/utils';
import { oneWay } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';

export let MockFilter = EmberObject.extend({
  clause: null,
  summary: null
});

export let MockProjection = EmberObject.extend({
  field: null,
  name: null
});

export let MockAggregation = EmberObject.extend({
  type: null,
  size: null,
  groups: null,
  metrics: null,
  attributes: null,

  init() {
    this.setProperties({ _metrics: A(), _groups: A() });
  }
});

export let MockGroup = EmberObject.extend({
  field: null,
  name: null
});

export let MockMetric = EmberObject.extend({
  type: null,
  field: null,
  name: null
});

export let MockResult = EmberObject.extend({
  metadata: null,
  records: null,
  created: null,
  querySnapshot: null,
  pivotOptions: null
});

export default EmberObject.extend({
  filter: null,
  projections: null,
  aggregation: null,
  results: null,
  duration: null,
  created: null,
  name: null,
  shouldValidate: true,
  promisify: false,
  window: null,

  init() {
    this.setProperties({
      _filter: EmberObject.create(),
      _projections: A(),
      _aggregation: EmberObject.create(),
      _results: A(),
      _window: null
    });
    A(['filter', 'projections', 'aggregation', 'results', 'window']).forEach(this.topLevelPropertyAsPromise, this);
  },

  isWindowless: computed('_window', function() {
    return isEmpty(this._window);
  }),

  topLevelPropertyAsPromise(attr) {
    if (this.promisify) {
      this.set(attr, resolve(this.get(`_${attr}`)));
    } else {
      this.set(attr, this.get(`_${attr}`));
    }
  },

  nestedPropertyAsPromise(top, nested) {
    let attr = `${top}.${nested}`;
    if (this.promisify) {
      this.set(attr, resolve(this.get(`_${top}._${nested}`)));
    } else {
      this.set(attr, this.get(`_${top}._${nested}`));
    }
  },

  addFilter(clause, summary = '') {
    this.set('_filter', MockFilter.create({ clause, summary }));
    this.topLevelPropertyAsPromise('filter');
  },

  addProjection(field, name) {
    this._projections.pushObject(MockProjection.create({ field, name }));
    this.topLevelPropertyAsPromise('projections');
  },

  addAggregation(type, size = 1, attributes = { }) {
    this.set('_aggregation', MockAggregation.create({ type, size, attributes }));
    this.topLevelPropertyAsPromise('aggregation');
    this.nestedPropertyAsPromise('aggregation', 'groups');
    this.nestedPropertyAsPromise('aggregation', 'metrics');
  },

  addGroup(field, name) {
    let aggregation = this._aggregation;
    aggregation.get('_groups').pushObject(MockGroup.create({ field, name }));
    this.nestedPropertyAsPromise('aggregation', 'groups');
  },

  addMetric(type, field, name) {
    let aggregation = this._aggregation;
    aggregation.get('_metrics').pushObject(MockMetric.create({ type, field, name }));
    this.nestedPropertyAsPromise('aggregation', 'metrics');
  },

  addResult(records, created = new Date(Date.now()), metadata = null, querySnapshot = null, pivotOptions = null) {
    this._results.pushObject(MockResult.create({ records, created, metadata, querySnapshot, pivotOptions }));
    this.topLevelPropertyAsPromise('results');
  },

  addWindow(emitType, emitEvery, includeType) {
    this.set('_window', EmberObject.create({
      emit: {
        type: emitType,
        every: emitEvery
      },
      include: {
        type: includeType
      }
    }));
    this.topLevelPropertyAsPromise('window');
  },

  deleteWindow() {
    this.set('_window', null);
    this.topLevelPropertyAsPromise('window');
  },

  validate() {
    let shouldValidate = this.shouldValidate;
    if (shouldValidate) {
      return resolve({ validations: EmberObject.create({ isValid: true }) });
    }
    return resolve({ validations: EmberObject.create({ isValid: false, messages: ['Forced to not validate'] }) });
  },

  filterSummary: oneWay('_filter.summary'),

  fieldsSummary: computed('_projections.[]', '_aggregation.{_groups.[],_metrics.[]}', function() {
    let projections = this.concatFieldLikes(this._projections);
    let groups = this.concatFieldLikes(this.get('_aggregation._groups'));
    let metrics = this.concatFieldLikes(this.get('_aggregation._metrics'));
    let fields = ['newName', 'points', 'numberOfPoints', 'start', 'end', 'increment'];
    let attributes = this.concatProperties(this.get('_aggregation.attributes'), fields);
    return `${projections}${groups}${metrics}${attributes}`;
  }),

  windowSummary: computed('_window.{emitType,emitEvery,includeType}', function() {
    if (isEmpty(this._window)) {
      return 'None';
    }
    return `${this.get('_window.emitType')}${this.get('_window.emitEvery')}${this.get('_window.includeType')}`;
  }),

  latestResult: computed('_results.[]', function() {
    let length = this.get('_results.length');
    return EmberObject.create({ created: new Date(2016, 0, (length + 1) % 30) });
  }),

  concatFieldLikes(fieldLikes) {
    if (isEmpty(fieldLikes)) {
      return '';
    }
    return fieldLikes.reduce((p, c) => `${p}${c.name}`, '');
  },

  concatProperties(object, fields) {
    if (isEmpty(object)) {
      return '';
    }
    return fields.reduce((p, c) => {
      let field = object[c];
      return field ? `${p}${field}` : p;
    }, '');
  }
});

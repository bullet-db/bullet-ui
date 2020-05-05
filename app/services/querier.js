/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import $ from 'jquery';
import { isNone, isEmpty, isEqual } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';
import Filterizer from 'bullet-ui/mixins/filterizer';
import { AGGREGATIONS, DISTRIBUTIONS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';

export default Service.extend(Filterizer, {
  stompWebsocket: service(),

  subfieldSuffix: '.*',
  subfieldSeparator: '.',
  delimiter: ',',
  apiMode: true,
  pendingRequest: null,

  isRunningQuery: alias('stompWebsocket.isConnected').readOnly(),

  defaultAPIAggregation: alias('settings.defaultAggregation').readOnly(),

  defaultAggregation: computed('defaultAPIAggregation', function() {
    let aggregation = this.defaultAPIAggregation;
    aggregation.type = AGGREGATIONS.get(aggregation.type);
    return aggregation;
  }).readOnly(),

  /**
   * Recreates a Ember Data like representation from an API query specification.
   * @param  {Object} json The API Bullet query.
   * @return {Object}      An Ember Object that looks like the Ember Data representation.
   */
  recreate(json) {
    let query = EmberObject.create();
    let clause = this.recreateFilter(json.filters);
    let projection = this.recreateProjections(json.projection);
    let aggregation = this.recreateAggregation(json.aggregation);
    let window = this.recreateWindow(json.window);

    let filter = EmberObject.create();
    if (!this.isTruthy(clause)) {
      clause = this.emptyClause;
    }
    filter.set('clause', clause);
    // One additional non-API key placed into the object for summarizing. Copy the summary as is
    this.setIfTruthy(filter, 'summary', json.filterSummary);

    this.setIfTruthy(query, 'filter', filter);
    this.setIfTruthy(query, 'projections', projection);
    this.setIfTruthy(query, 'aggregation', aggregation);
    this.setIfTruthy(query, 'window', window);
    this.setIfTruthy(query, 'name', json.name);
    query.set('duration', Number(json.duration) / 1000);
    return query;
  },

  /**
   * Converts an internal Ember Bullet query to the API query specification.
   * @param  {Object} query An Ember Data object representing the query.
   * @return {Object}       The API Bullet query.
   */
  reformat(query) {
    let json = { };
    let filter = this.reformatFilter(query.get('filter'));
    let projection = this.reformatProjections(query.get('projections'));
    let aggregation = this.reformatAggregation(query.get('aggregation'));

    if (!query.get('isWindowless')) {
      json.window = this.reformatWindow(query.get('window'));
    }

    if (filter) {
      json.filters = [filter];
    }
    if (!this.apiMode) {
      this.assignIfTruthy(json, 'name', query.get('name'));
      this.assignIfTruthy(json, 'filterSummary', query.get('filter.summary'));
    }
    if (projection) {
      json.projection = { fields: projection };
    }
    this.assignIfTruthy(json, 'aggregation', aggregation);
    json.duration = Number(query.get('duration')) * 1000;
    return json;
  },

  recreateFilter(json) {
    if (isNone(json)) {
      return false;
    }
    let rule = json[0];
    return this.convertClauseToRule(rule);
  },

  reformatFilter(filter) {
    if (isNone(filter)) {
      return false;
    }
    let clause = filter.get('clause');
    if (!clause || $.isEmptyObject(clause)) {
      return false;
    }
    let converted = this.convertRuleToClause(clause);
    let innerClauses = converted.clauses;
    if (isEmpty(innerClauses)) {
      return false;
    }
    // If we got here, we should have a valid clause.
    let innerClause = converted.clauses[0];
    // Unbox if it's a single simple filter nested inside
    if (innerClauses.length === 1 && !this.isLogical(innerClause.operation)) {
      return innerClause;
    }
    return converted;
  },

  recreateProjections(json) {
    if (isEmpty(json)) {
      return false;
    }
    return this.makeFields(json.fields);
  },

  reformatProjections(projections) {
    return this.getFields(projections);
  },

  recreateAggregation(json) {
    if (isEmpty(json)) {
      return false;
    }
    let aggregation = EmberObject.create();
    let groups = this.makeFields(json.fields);
    let metrics = this.makeMetrics(json.attributes);
    let attributes = this.makeAttributes(json.attributes);

    aggregation.set('type', AGGREGATIONS.get(this.snakeCase(json.type)));
    this.setIfTruthy(aggregation, 'groups', groups);
    this.setIfTruthy(aggregation, 'metrics', metrics);
    aggregation.set('attributes', attributes);
    aggregation.set('size', Number(json.size));

    return aggregation;
  },

  recreateWindow(json) {
    if (isEmpty(json)) {
      return false;
    }

    let emit = EmberObject.create({
      type: EMIT_TYPES.get(json.emit.type),
      every: isEqual(json.emit.type, 'TIME') ? Number(json.emit.every) / 1000 : Number(json.emit.every)
    });

    let include = EmberObject.create();
    if (!isEmpty(json.include) && isEqual(json.include.type, 'ALL')) {
      include.set('type', INCLUDE_TYPES.get('ALL'));
    } else {
      include.set('type', INCLUDE_TYPES.get('WINDOW'));
    }
    return EmberObject.create({
      emit: emit,
      include: include
    });
  },

  reformatAggregation(aggregation) {
    if (isEmpty(aggregation)) {
      return false;
    }
    let json = { };
    let fields = this.getFields(aggregation.get('groups'));
    let attributes = this.getAttributes(aggregation);

    json.type = AGGREGATIONS.apiKey(aggregation.get('type'));
    json.size = Number(aggregation.get('size'));
    this.assignIfTruthy(json, 'fields', fields);
    this.assignIfTruthy(json, 'attributes', attributes);

    return json;
  },

  reformatWindow(window) {
    let emitType = window.get('emit.type');
    let emitEvery = window.get('emit.every');
    let json = {
      emit: {
        type: EMIT_TYPES.apiKey(emitType),
        every: isEqual(emitType, EMIT_TYPES.get('TIME')) ? Number(emitEvery) * 1000 : Number(emitEvery)
      }
    };

    let includeType = window.get('include.type');
    if (isEqual(includeType, INCLUDE_TYPES.get('ALL'))) {
      json.include = { type: INCLUDE_TYPES.apiKey(includeType) };
    }
    return json;
  },

  makeFields(json, fieldName = 'field', valueName = 'name') {
    if (isEmpty(json)) {
      return false;
    }
    let fields = A();
    for (let key in json) {
      let field = EmberObject.create();
      this.setIfTruthy(field, fieldName, key);
      this.setIfTruthy(field, valueName, json[key]);
      fields.pushObject(field);
    }
    return fields;
  },

  getFields(enumerable, sourceName = 'field', targetName = 'name') {
    if (isEmpty(enumerable)) {
      return false;
    }
    let json = { };
    enumerable.forEach(item => {
      json[item.get(sourceName)] = item.get(targetName);
    });
    return json;
  },

  makeAttributes(json) {
    if (isEmpty(json)) {
      return EmberObject.create();
    }

    let attributes = { };

    // COUNT_DISTINCT, TOP_K
    this.assignIfTruthy(attributes, 'newName', json.newName);

    // DISTRIBUTION
    this.assignIfTruthy(attributes, 'pointType', json.pointType);
    this.assignIfTruthyNumeric(attributes, 'start', json.start);
    this.assignIfTruthyNumeric(attributes, 'end', json.end);
    this.assignIfTruthyNumeric(attributes, 'increment', json.increment);
    this.assignIfTruthyNumeric(attributes, 'numberOfPoints', json.numberOfPoints);
    this.assignIfTruthy(attributes, 'points', this.makePoints(json.points));
    if (!isEmpty(json.type)) {
      this.assignIfTruthy(attributes, 'type', DISTRIBUTIONS.get(json.type));
    }
    // TOP_K
    this.assignIfTruthyNumeric(attributes, 'threshold', json.threshold);

    return EmberObject.create(attributes);
  },

  getAttributes(aggregation) {
    let json = { };

    // COUNT_DISTINCT, TOP_K
    this.assignIfTruthy(json, 'newName', aggregation.get('attributes.newName'));

    // DISTRIBUTION
    this.assignIfTruthyNumeric(json, 'start', aggregation.get('attributes.start'));
    this.assignIfTruthyNumeric(json, 'end', aggregation.get('attributes.end'));
    this.assignIfTruthyNumeric(json, 'increment', aggregation.get('attributes.increment'));
    this.assignIfTruthyNumeric(json, 'numberOfPoints', aggregation.get('attributes.numberOfPoints'));
    this.assignIfTruthy(json, 'points', this.getPoints(aggregation.get('attributes.points')));
    if (!this.apiMode) {
      this.assignIfTruthy(json, 'pointType', aggregation.get('attributes.pointType'));
    }
    this.assignIfTruthy(json, 'type', DISTRIBUTIONS.apiKey(aggregation.get('attributes.type')));

    // TOP_K
    this.assignIfTruthyNumeric(json, 'threshold', aggregation.get('attributes.threshold'));

    // GROUP
    let operations = this.getGroupOperations(aggregation.get('metrics'));
    this.assignIfTruthy(json, 'operations', operations);

    return $.isEmptyObject(json) ? false : json;
  },

  makeMetrics(attributes) {
    if (isEmpty(attributes)) {
      return false;
    }
    return this.makeGroupOperations(attributes.operations);
  },

  makeGroupOperations(json) {
    if (isEmpty(json)) {
      return false;
    }
    let groupOperations = A();
    json.forEach(item => {
      let type = METRICS.get(item.type);
      let operation = EmberObject.create({ type });
      this.setIfTruthy(operation, 'field', item.field);
      this.setIfTruthy(operation, 'name', item.newName);
      groupOperations.pushObject(operation);
    });
    return groupOperations;
  },

  getGroupOperations(metrics) {
    if (isEmpty(metrics)) {
      return false;
    }
    let json = [];
    metrics.forEach(item => {
      let invertedType = METRICS.invert(item.get('type'));
      let metric = { type: invertedType };
      this.assignIfTruthy(metric, 'field', item.get('field'));
      this.assignIfTruthy(metric, 'newName', item.get('name'));
      json.push(metric);
    });
    return json;
  },

  makePoints(points) {
    if (isEmpty(points)) {
      return false;
    }
    return points.join(',');
  },

  getPoints(points) {
    let json = [];
    if (!isEmpty(points)) {
      points.split(',').map(s => s.trim()).forEach(n => json.push(parseFloat(n)));
    }
    return json;
  },

  snakeCase(string) {
    return string.replace(/ /g, '_');
  },

  assignIfTruthyNumeric(json, key, value) {
    if (!isEmpty(value)) {
      json[key] = parseFloat(value);
    }
    return json;
  },

  isTruthy(value) {
    // Also works for boolean false -> Object.keys(false) = []
    return !isEmpty(value) && Object.keys(value).length !== 0;
  },

  assignIfTruthy(json, key, value) {
    if (this.isTruthy(value)) {
      json[key] = value;
    }
    return json;
  },

  setIfTruthy(object, key, value) {
    if (this.isTruthy(value)) {
      object.set(key, value);
    }
    return object;
  },

  send(data, handlers, context) {
    this.stompWebsocket.startStompClient(this.reformat(data), handlers, context);
  },

  cancel() {
    this.stompWebsocket.disconnect();
  }
});

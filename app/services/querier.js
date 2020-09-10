/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { isNone, isEqual } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';
import isEmpty from 'bullet-ui/utils/is-empty';
import Filterizer, { EMPTY_CLAUSE } from 'bullet-ui/utils/filterizer';
import QueryConverter from 'bullet-ui/utils/query-converter';
import {
  AGGREGATION_TYPES, DISTRIBUTION_TYPES, METRIC_TYPES, EMIT_TYPES, INCLUDE_TYPES
} from 'bullet-ui/utils/query-constants';

export default class QuerierService extends Service {
  @service stompWebsocket;
  filterizer;
  apiMode;
  @alias('stompWebsocket.isConnected') isRunningQuery;
  @alias('settings.defaultAggregation') defaultAPIAggregation;

  constructor() {
    super(...arguments);
    this.filterizer = new Filterizer();
    this.setAPIMode(true);
  }

  setAPIMode(mode) {
    this.apiMode = mode;
    this.filterizer.setAPIMode(mode);
  }

  @computed('defaultAPIAggregation').readOnly()
  get defaultAggregation() {
    let aggregation = this.defaultAPIAggregation;
    aggregation.type = AGGREGATION_TYPES.description(aggregation.type);
    return aggregation;
  }

  /**
   * Converts an internal Ember Bullet query to the API query specification.
   * @param {Object} query An Ember Data object representing the query.
   * @return {Object} The API Bullet query.
   */
  reformat(query) {
    return QueryConverter.createBQL(query);
  }

  /**
   * Recreates a Ember Data like representation from an API query specification.
   * @param {Object} json The API Bullet query.
   * @return {Object} An Ember Object that looks like the Ember Data representation.
   */
  recreate(json) {
    let query = EmberObject.create();
    let clause = this.recreateFilter(json.filters);
    let projection = this.recreateProjections(json.projection);
    let aggregation = this.recreateAggregation(json.aggregation);
    let window = this.recreateWindow(json.window);

    let filter = EmberObject.create();
    if (!QuerierService.isTruthy(clause)) {
      clause = EMPTY_CLAUSE;
    }
    filter.set('clause', clause);
    // One additional non-API key placed into the object for summarizing. Copy the summary as is
    QuerierService.setIfTruthy(filter, 'summary', json.filterSummary);

    QuerierService.setIfTruthy(query, 'filter', filter);
    QuerierService.setIfTruthy(query, 'projections', projection);
    QuerierService.setIfTruthy(query, 'aggregation', aggregation);
    QuerierService.setIfTruthy(query, 'window', window);
    QuerierService.setIfTruthy(query, 'name', json.name);
    query.set('duration', Number(json.duration) / 1000);
    return query;
  }

  recreateFilter(json) {
    if (isNone(json)) {
      return false;
    }
    let rule = json[0];
    return this.filterizer.convertClauseToRule(rule);
  }

  recreateProjections(json) {
    if (isEmpty(json)) {
      return false;
    }
    return this.makeFields(json.fields);
  }

  recreateAggregation(json) {
    if (isEmpty(json)) {
      return false;
    }
    let aggregation = EmberObject.create();
    let groups = this.makeFields(json.fields);
    let metrics = this.makeMetrics(json.attributes);
    let attributes = this.makeAttributes(json.attributes);

    aggregation.set('type', AGGREGATION_TYPES.description(QuerierService.snakeCase(json.type)));
    QuerierService.setIfTruthy(aggregation, 'groups', groups);
    QuerierService.setIfTruthy(aggregation, 'metrics', metrics);
    aggregation.set('attributes', attributes);
    aggregation.set('size', Number(json.size));

    return aggregation;
  }

  recreateWindow(json) {
    if (isEmpty(json)) {
      return false;
    }

    let emitType = EMIT_TYPES.description(json.emit.type);
    let emitEvery = isEqual(EMIT_TYPES[json.emit.type], EMIT_TYPES.TIME) ? Number(json.emit.every) / 1000 : Number(json.emit.every);

    let includeType;
    if (!isEmpty(json.include) && isEqual(INCLUDE_TYPES[json.include.type], INCLUDE_TYPES.ALL)) {
      includeType = INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL);
    } else {
      includeType = INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW);
    }
    return EmberObject.create({
      emitType: emitType,
      emitEvery: emitEvery,
      includeType: includeType
    });
  }

  makeFields(json, fieldName = 'field', valueName = 'name') {
    if (isEmpty(json)) {
      return false;
    }
    let fields = A();
    for (let key in json) {
      let field = EmberObject.create();
      QuerierService.setIfTruthy(field, fieldName, key);
      QuerierService.setIfTruthy(field, valueName, json[key]);
      fields.pushObject(field);
    }
    return fields;
  }

  makeAttributes(json) {
    if (isEmpty(json)) {
      return EmberObject.create();
    }

    let attributes = { };

    // COUNT_DISTINCT, TOP_K
    QuerierService.assignIfTruthy(attributes, 'newName', json.newName);

    // DISTRIBUTION
    QuerierService.assignIfTruthy(attributes, 'pointType', json.pointType);
    QuerierService.assignIfTruthyNumeric(attributes, 'start', json.start);
    QuerierService.assignIfTruthyNumeric(attributes, 'end', json.end);
    QuerierService.assignIfTruthyNumeric(attributes, 'increment', json.increment);
    QuerierService.assignIfTruthyNumeric(attributes, 'numberOfPoints', json.numberOfPoints);
    QuerierService.assignIfTruthy(attributes, 'points', this.makePoints(json.points));
    if (!isEmpty(json.type)) {
      QuerierService.assignIfTruthy(attributes, 'type', DISTRIBUTION_TYPES.description(json.type));
    }
    // TOP_K
    QuerierService.assignIfTruthyNumeric(attributes, 'threshold', json.threshold);

    return EmberObject.create(attributes);
  }

  makeMetrics(attributes) {
    if (isEmpty(attributes)) {
      return false;
    }
    return this.makeGroupOperations(attributes.operations);
  }

  makeGroupOperations(json) {
    if (isEmpty(json)) {
      return false;
    }
    let groupOperations = A();
    json.forEach(item => {
      let type = METRIC_TYPES.description(item.type);
      let operation = EmberObject.create({ type: type });
      QuerierService.setIfTruthy(operation, 'field', item.field);
      QuerierService.setIfTruthy(operation, 'name', item.newName);
      groupOperations.pushObject(operation);
    });
    return groupOperations;
  }

  makePoints(points) {
    if (isEmpty(points)) {
      return false;
    }
    return points.join(',');
  }

  static snakeCase(string) {
    return string.replace(/ /g, '_');
  }

  static spaceCase(string) {
    return string.replace(/_/g, ' ');
  }

  static assignIfTruthyNumeric(json, key, value) {
    if (!isEmpty(value)) {
      json[key] = parseFloat(value);
    }
    return json;
  }

  static isTruthy(value) {
    // Also works for boolean false -> Object.keys(false) = []
    return !isEmpty(value) && Object.keys(value).length !== 0;
  }

  static assignIfTruthy(json, key, value) {
    if (QuerierService.isTruthy(value)) {
      json[key] = value;
    }
    return json;
  }

  static setIfTruthy(object, key, value) {
    if (QuerierService.isTruthy(value)) {
      object.set(key, value);
    }
    return object;
  }

  send(data, handlers, context) {
    this.stompWebsocket.startStompClient(this.reformat(data), handlers, context);
  }

  cancel() {
    this.stompWebsocket.disconnect();
  }
}

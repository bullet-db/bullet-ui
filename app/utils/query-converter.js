/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isNone, isEqual } from '@ember/utils';
import isEmpty from 'bullet-ui/utils/is-empty';
import {
  AGGREGATION_TYPES, DISTRIBUTION_TYPES, METRIC_TYPES, EMIT_TYPES, INCLUDE_TYPES
} from 'bullet-ui/utils/query-constants';

const MS_SECOND = 1000;

const LEFT_PAREN = '(';
const RIGHT_PAREN = ')';

const FROM_STREAM = 'FROM STREAM('

/**
 * This class provides methods to convert a subset of queries supported by the simple query building interface to and
 * from BQL. It does not the support the full BQL interface.
 */
export default class QueryConverter {
  /**
   * Recreates a Ember Data like representation from a BQL query.
   * @param {Object} bql The String BQL query.
   * @return {Object} An Ember Object that looks like the Ember Data representation.
   */
  createQuery(bql) {
  }

  /**
   * Reformats a Ember Data like representation to a BQL query.
   * @param {Object} query An Ember Object that looks like the Ember Data representation of a query.
   * @return {Object} A String BQL query.
   */
  static createBQL(query) {
    let aggregation = query.get('aggregation');
    let type = AGGREGATION_TYPES.forName(AGGREGATION_TYPES.name(query.get('aggregation.type')));

    let select = QueryConverter.createSelect(type, query, aggregation);
    let from = QueryConverter.createFrom(query);
    let where = QueryConverter.createWhere(query.get('filter'));
    let groupBy = QueryConverter.createGroupBy(type, aggregation);
    // No need for HAVING
    // No need for ORDER
    let windowing = QueryConverter.createWindowing(query.get('window'));
    let limit = QueryConverter.createLimit(type, aggregation);
    return `${select} ${from} ${where} ${groupBy} ${windowing} ${limit}`;
  }

  static createSelect(type, query, aggregation) {
    switch (type) {
      case AGGREGATION_TYPES.RAW:
        return createSelectRaw(query);
      case AGGREGATION_TYPES.COUNT_DISTINCT:
        return createSelectCountDistinct(aggregation);
      case AGGREGATION_TYPES.GROUP:
        return createSelectGroup(aggregation);
      case AGGREGATION_TYPES.DISTRIBUTION:
        return createSelectDistribution(aggregation);
      case AGGREGATION_TYPES.TOP_K:
        return createSelectTopK(aggregation);
    }
  }

  static createSelectRaw(query) {
    let projections = query.get('projections');
    if (isEmpty(projections)) {
      return 'SELECT *';
    }
    return `SELECT ${projections.map(projection => QueryConverter.createField(projection)).toArray().join(', ')}`;
  }

  static createSelectCountDistinct(aggregation) {
    let fields = aggregation.get('groups');
    let alias = aggregation.get('attributes.newName');
    fields = fields.mapBy('field').toArray().join(', ');
    let optionalAlias = isEmpty(alias) ? '' : ` AS "${alias}"`;
    return `SELECT COUNT(DISTINCT ${fields})${optionalAlias}`;
  }

  static createSelectGroup(aggregation) {
    let groups = aggregation.get('groups');
    let metrics = aggregation.get('metrics');

    let fields = groups.map(group => QueryConverter.createField(group)).toArray().join(', ');
    let aggregates = metrics.map(metric => {
      let operation = METRIC_TYPES.name(metric.get('type'));
      let type = METRIC_TYPES.forName(operation);
      switch (type) {
        case METRIC_TYPES.COUNT:
          return `COUNT(*)`;
        case METRIC_TYPES.SUM:
        case METRIC_TYPES.COUNT:
        case METRIC_TYPES.MIN:
        case METRIC_TYPES.MAX:
        case METRIC_TYPES.AVG:
          return `${operation}(${metric.get('field')}) AS "${metric.get('name')}"`
      }
    }).toArray().join(', ');

    if (isEmpty(groups)) {
      return `SELECT ${aggregates}`;
    } else if (isEmpty(metrics)) {
      return `SELECT ${fields}`;
    } else {
      return `SELECT ${fields}, ${aggregates}`;
    }
  }

  static createSelectDistribution(aggregation) {
    let distribution = DISTRIBUTION_TYPES.name(aggregation.get('attributes.type'));
    // Only one
    let field = aggregation.get('groups').map(group => QueryConverter.createField(group)).firstObject;

    let pointType = DISTRIBUTION_POINT_TYPES.name(aggregation.get('attributes.pointType'));
    let type = DISTRIBUTION_POINT_TYPES.forName(pointType);
    let points;
    switch (type) {
      case DISTRIBUTION_POINT_TYPES.NUMBER:
        let numberOfPoints = parseFloat(aggregation.get('attributes.numberOfPoints'));
        points = `LINEAR, ${numberOfPoints}`;
        break;
      case DISTRIBUTION_POINT_TYPES.POINTS:
        let manual = aggregation.get('attributes.points');
        points = `MANUAL, ${manual.split(',').map(p => parseFloat(p.trim())).join(', ')}`;
        break;
      case DISTRIBUTION_POINT_TYPES.GENERATED:
        let start = parseFloat(aggregation.get('attributes.start'));
        let end = parseFloat(aggregation.get('attributes.end'));
        let increment = parseFloat(aggregation.get('attributes.increment'));
        points = `REGION, ${start}, ${end}, ${increment}`;
        break;
    }
    return `SELECT ${distribution}(${field}, ${points})`;
  }

  static createSelectTopK(aggregation) {
    let groups = aggregation.get('groups');
    let k = Number(aggregation.get('size'));
    let threshold = aggregation.get('attributes.threshold');
    let optionalThreshold = isEmpty(threshold) ? '' : `, ${Number(threshold)}`;
    let fields = groups.mapBy('field').toArray().join(', ');

    let newName = aggregation.get('attributes.newName');
    let optionalAlias = isEmpty(newName) ? '' : ` AS "${newName}"`;

    let renames = groups.map(field => QueryConverter.createField(field)).toArray().join(', ');

    return `SELECT TOP(${k}${optionalThreshold}, ${fields})${optionalAlias}, ${renames}`;
  }

  static createFrom(query) {
    let duration = Number(query.get('duration')) * MS_SECOND;
    return `FROM STREAM(${duration}, TIME)`
  }

  static createWhere(filter) {
    if (isNone(filter)) {
      return '';
    }
    return filter.get('summary');
  }

  static createGroupBy(type, aggregation) {
    let fields = aggregation.get('groups');
    if (type !== AGGREGATION_TYPES.GROUP || isEmpty(fields)) {
      return '';
    }
    return `GROUP BY ${fields.mapBy('field').toArray().join(', ')}`;
  }

  static createWindowing(window) {
    if (isEmpty(window)) {
      return '';
    }
    let emitType = window.get('emitType');
    let emitEvery = window.get('emitEvery');
    emitEvery = isEqual(emitType, EMIT_TYPES.describe(EMIT_TYPES.TIME)) ? Number(emitEvery) * 1000 : Number(emitEvery);
    let type = EMIT_TYPES.name(emitType);
    let isAll = isEqual(window.get('includeType'), INCLUDE_TYPES.describe(INCLUDE_TYPES.START));
    return isAll ? `WINDOWING EVERY(${emitEvery}, ${type}, ALL)` : `WINDOWING TUMBLING(${emitEvery}, ${type})`;
  }

  static createLimit(type, aggregation) {
    switch (type) {
      case AGGREGATION_TYPES.RAW:
      case AGGREGATION_TYPES.GROUP:
      case AGGREGATION_TYPES.DISTRIBUTION:
        let size = Number(aggregation.get('size'));
        return `LIMIT ${size}`;
      default:
        return '';
    }
  }

  static createField(field, fieldName = 'field', aliasName = 'name') {
    return `"${field.get(fieldName)}" AS "${field.get(aliasName)}"`;
  }
}

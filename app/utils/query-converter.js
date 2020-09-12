/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { isNone, isEqual } from '@ember/utils';
import isEmpty from 'bullet-ui/utils/is-empty';
import {
  AGGREGATION_TYPES, DISTRIBUTION_TYPES, DISTRIBUTION_POINT_TYPES, METRIC_TYPES, EMIT_TYPES, INCLUDE_TYPES
} from 'bullet-ui/utils/query-constants';

/**
 * Creates a non-capturing group for the given keyword and captures the content (non-greedily) after the keyword
 * in a named group with the given groupName
  * @param {[type]} keyword The keyword to capture. If multiple words, will be converted to have one or more whitespace.
  * @param {[type]} groupName The name of the capture group for the content after the keyword (non-greedy).
  * @return {[type]} A String that represents the regex.
  */
function regex(keyword, groupName) {
  // Split by whitespace and join back the words using the literal '\s+;'
  keyword = keyword.split(/\s+/).join('\\s+');
  return `(?:${keyword}\\s+(?<${groupName}>.+?))`
}

const S = regex('SELECT', 'select');
const F = regex('FROM', 'from');
const WH = regex('WHERE', 'where');
const G = regex('GROUP BY', 'groupBy');
const H = regex('HAVING', 'having');
const O = regex('ORDER BY', 'orderBy');
const WI = regex('WINDOWING', 'windowing');
const L = regex('LIMIT', 'limit');
// Handles Having and Order By as well
const SQL = new RegExp(`^${S}\\s+${F}\\s+${WH}?\\s*${G}?\\s*${H}?\\s*${O}?\\s*${WI}?\\s*${L}?\\s*;?$`, 'i');

const STREAM = /(?:STREAM\s*\((?<duration>\d*)(?:,\s*TIME)?\))/i

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
  static recreateQuery(bql) {
    let query = EmberObject.create();
    if (isEmpty(bql)) {
      return query;
    }
    let result = bql.match(SQL);
    // Ignore orderBy and having
    let { select, from, where, groupBy, windowing, limit } = result.groups;
    QueryConverter.recreateFilter(query, where);
    QueryConverter.recreateProjections(query, select);
    QueryConverter.recreateAggregation(query, select, groupBy, limit);
    QueryConverter.recreateWindow(query, windowing);
    QueryConverter.recreateDuration(query, from);
    return query;
  }

  static recreateFilter(query, where) {
    if (isEmpty(where)) {
      return;
    }
    let filter = EmberObject.create();
    filter.set('summary', where);
    query.set('filter', filter);
  }

  static recreateProjections(query, select) {
  }

  static recreateAggregation(query, select, groupby, limit) {
  }

  static recreateWindow(query, windowing) {
  }

  static recreateDuration(query, from) {
    let { duration } = from.match(STREAM).groups;
    if (duration) {
      query.set('duration', Number(duration) / 1000);
    }
  }

  /**
   * Creates a BQL query from a Ember Data like representation.
   * @param {Object} query An Ember Object that looks like the Ember Data representation of a query.
   * @return {Object} A String BQL query.
   */
  static createBQL(query) {
    let aggregation = query.get('aggregation');
    let type = AGGREGATION_TYPES.forName(AGGREGATION_TYPES.name(aggregation.get('type')));

    // No need for HAVING or ORDER
    let select = QueryConverter.createSelect(type, query, aggregation);
    let from = QueryConverter.createFrom(query);
    let where = QueryConverter.createOptionalWhere(query.get('filter'));
    let groupBy = QueryConverter.createOptionalGroupBy(type, aggregation);
    let windowing = QueryConverter.createOptionalWindowing(query.get('window'));
    let limit = QueryConverter.createOptionalLimit(type, aggregation);
    // Optionals are responsible for adding a trailing space if they exist
    return `${select} ${from} ${where}${groupBy}${windowing}${limit};`;
  }

  static createSelect(type, query, aggregation) {
    switch (type) {
      case AGGREGATION_TYPES.RAW:
        return QueryConverter.createSelectRaw(query);
      case AGGREGATION_TYPES.COUNT_DISTINCT:
        return QueryConverter.createSelectCountDistinct(aggregation);
      case AGGREGATION_TYPES.GROUP:
        return QueryConverter.createSelectGroup(aggregation);
      case AGGREGATION_TYPES.DISTRIBUTION:
        return QueryConverter.createSelectDistribution(aggregation);
      case AGGREGATION_TYPES.TOP_K:
        return QueryConverter.createSelectTopK(aggregation);
    }
  }

  static createSelectRaw(query) {
    let projections = query.get('projections');
    if (isEmpty(projections)) {
      return 'SELECT *';
    }
    return `SELECT ${projections.map(projection => QueryConverter.createField(projection)).join(', ')}`;
  }

  static createSelectCountDistinct(aggregation) {
    let fields = aggregation.get('groups').mapBy('field').join(', ');
    let alias = aggregation.get('attributes.newName');
    let optionalAlias = isEmpty(alias) ? '' : ` AS "${alias}"`;
    return `SELECT COUNT(DISTINCT ${fields})${optionalAlias}`;
  }

  static createSelectGroup(aggregation) {
    let groups = aggregation.get('groups');
    let metrics = aggregation.get('metrics');

    let fields = groups.map(group => QueryConverter.createField(group)).join(', ');
    let aggregates = metrics.map(metric => {
      let operation = METRIC_TYPES.name(metric.get('type'));
      let type = METRIC_TYPES.forName(operation);
      let alias = metric.get('name');
      let optionalAlias = isEmpty(alias) ? '' : ` AS "${alias}"`;
      switch (type) {
        case METRIC_TYPES.COUNT:
          return `COUNT(*)${optionalAlias}`;
        case METRIC_TYPES.SUM:
        case METRIC_TYPES.MIN:
        case METRIC_TYPES.MAX:
        case METRIC_TYPES.AVG:
          return `${operation}(${metric.get('field')})${optionalAlias}`
      }
    }).join(', ');

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
    let field = aggregation.get('groups').mapBy('field')[0];

    let pointType = DISTRIBUTION_POINT_TYPES.name(aggregation.get('attributes.pointType'));
    let type = DISTRIBUTION_POINT_TYPES.forName(pointType);
    let points;
    switch (type) {
      case DISTRIBUTION_POINT_TYPES.NUMBER: {
        let numberOfPoints = parseFloat(aggregation.get('attributes.numberOfPoints'));
        points = `LINEAR, ${numberOfPoints}`;
        break;
      }
      case DISTRIBUTION_POINT_TYPES.POINTS: {
        let manual = aggregation.get('attributes.points');
        points = `MANUAL, ${manual.split(',').map(p => parseFloat(p.trim())).join(', ')}`;
        break;
      }
      case DISTRIBUTION_POINT_TYPES.GENERATED: {
        let start = parseFloat(aggregation.get('attributes.start'));
        let end = parseFloat(aggregation.get('attributes.end'));
        let increment = parseFloat(aggregation.get('attributes.increment'));
        points = `REGION, ${start}, ${end}, ${increment}`;
        break;
      }
    }
    return `SELECT ${distribution}(${field}, ${points})`;
  }

  static createSelectTopK(aggregation) {
    let groups = aggregation.get('groups');
    let k = Number(aggregation.get('size'));
    let threshold = aggregation.get('attributes.threshold');
    let optionalThreshold = isEmpty(threshold) ? '' : `, ${Number(threshold)}`;
    let fields = groups.mapBy('field').join(', ');

    let newName = aggregation.get('attributes.newName');
    let optionalAlias = isEmpty(newName) ? '' : ` AS "${newName}"`;

    let renames = groups.map(field => QueryConverter.createField(field)).join(', ');

    return `SELECT TOP(${k}${optionalThreshold}, ${fields})${optionalAlias}, ${renames}`;
  }

  static createFrom(query) {
    let duration = Number(query.get('duration')) * 1000;
    return `FROM STREAM(${duration}, TIME)`
  }

  static createOptionalWhere(filter) {
    if (isNone(filter)) {
      return '';
    }
    let summary = filter.get('summary');
    // Shouldn't get filters with no summaries ideally
    return isEmpty(summary) ? '' : `WHERE ${summary} `;
  }

  static createOptionalGroupBy(type, aggregation) {
    if (type !== AGGREGATION_TYPES.GROUP) {
      return '';
    }
    let fields = aggregation.get('groups');
    if (isEmpty(fields)) {
      return '';
    }
    return `GROUP BY ${fields.mapBy('field').join(', ')} `;
  }

  static createOptionalWindowing(window) {
    if (isEmpty(window)) {
      return '';
    }
    let emitType = window.get('emitType');
    let emitEvery = window.get('emitEvery');
    emitEvery = isEqual(emitType, EMIT_TYPES.describe(EMIT_TYPES.TIME)) ? Number(emitEvery) * 1000 : Number(emitEvery);
    let type = EMIT_TYPES.name(emitType);
    let isAll = isEqual(window.get('includeType'), INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL));
    return isAll ? `WINDOWING EVERY(${emitEvery}, ${type}, ALL) ` : `WINDOWING TUMBLING(${emitEvery}, ${type}) `;
  }

  static createOptionalLimit(type, aggregation) {
    switch (type) {
      case AGGREGATION_TYPES.RAW:
      case AGGREGATION_TYPES.GROUP:
      case AGGREGATION_TYPES.DISTRIBUTION:
        return `LIMIT ${Number(aggregation.get('size'))} `;
      default:
        return '';
    }
  }

  static createField(field, fieldName = 'field', aliasName = 'name') {
    return `${field.get(fieldName)} AS "${field.get(aliasName)}"`;
  }
}

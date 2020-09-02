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
}

/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
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

// Full BQL regexes
const S = regex('SELECT', 'select');
const F = regex('FROM', 'from');
const WH = regex('WHERE', 'where');
const G = regex('GROUP BY', 'groupBy');
const H = regex('HAVING', 'having');
const O = regex('ORDER BY', 'orderBy');
const WI = regex('WINDOWING', 'windowing');
const L = regex('LIMIT', 'limit');
// Handles Having and Order By as well
const SQL = new RegExp(`^${S}\\s+${F}\\s*${WH}?\\s*${G}?\\s*${H}?\\s*${O}?\\s*${WI}?\\s*${L}?\\s*;?$`, 'i');

// Sub-BQL to Query parts regexes
const STREAM = /(?:STREAM\s*\(\s*(?<duration>\d*)(?:\s*,\s*TIME)?\s*\))/i;
const EVERY = /(?:EVERY\s*\(\s*(?<every>\d+)\s*,\s*(?<type>TIME|RECORD)\s*(?:,\s*(?<all>ALL))?\s*\))/i;
const TUMBLING = /(?:TUMBLING\s*\(\s*(?<every>\d+)\s*,\s*(?<type>TIME|RECORD)\s*\))/i;
const COUNT_DISTINCT = /COUNT\s*\(\s*DISTINCT (?<fields>.+?)\)\s*(?:AS\s+(?<alias>\S+?))?$/i;
const DISTRIBUTION = /.*?(?<type>\S+?)\s*\(\s*(?<field>\S+?)\s*,\s*(?<points>.+?)\s*\)/i;
const TOP_K = /.*?TOP\s*\(\s*(?<k>\d+)\s*(?:,\s*(?<threshold>\d+))?\s*,\s*(?<fields>.+?)\s*\)\s*(?:AS\s* (?<alias>\S+?))?(?:,\s*(?<renames>.+?))?$/i;
const FIELD = /\s*(?<name>\S+?)\s*(?:AS \s*(?<alias>\S+))?\s*$/i
const FUNCTION = /^\s*(?<type>\S+?)\s*\(\s*(?<field>\S+?)\s*\)\s*$/i;

// Aggregation Type test regexes
const COUNT_DISTINCT_TEST = /.*?COUNT\s*\(\s*DISTINCT .+?\).*/i;
const QUANTILE_TEST = new RegExp(`.*?${DISTRIBUTION_TYPES.identify(DISTRIBUTION_TYPES.QUANTILE)}\\s*\\(.+?\\).*`, 'i');
const FREQ_TEST = new RegExp(`.*?${DISTRIBUTION_TYPES.identify(DISTRIBUTION_TYPES.FREQ)}\\s*\\(.+?\\).*`, 'i');
const CUMFREQ_TEST = new RegExp(`.*?${DISTRIBUTION_TYPES.identify(DISTRIBUTION_TYPES.CUMFREQ)}\\s*\\(.+?\\).*`, 'i');
const TOP_TEST = /.*?TOP\s*\(.+?\).*/i;
const FUNCTIONAL = '(?:\\s*\\S+?\\s*\\(\\s*\\S+?\\s*\\)\\s*?(?: AS\\s+\\S+\\s*)?)';
const FUNCTIONAL_TEST = new RegExp(`^${FUNCTIONAL}(?:,*${FUNCTIONAL})*$`, 'i');
const METRIC = `(?:\\s*${METRIC_TYPES.names.join('|')}\\s*\\(\\s*\\S+?\\s*\\)\\s*?(?: AS\\s+\\S+\\s*)?)`;
const METRIC_TEST = new RegExp(`${METRIC}(?:,*${METRIC})*`, 'i');

/**
 * This class provides methods to convert a subset of queries supported by the simple query building interface to and
 * from BQL. It does not the support the full BQL interface.
 *
 * The main functions to be used are:
 * 1) createBQL(query) - Takes a builder query and makes a BQL query string out of it.
 * 2) recreateQuery(bql) - Takes a bql string and makes a builder query model like out of it.
 * 3) categorizeBQL(bql) - This method tries to work for all bql. Takes a bql string and tries to extract the following
 *                         A) type: aggregation type
 *                         B) duration: query duration
 *                         C) emitType: window emit type
 *                         D) emitEvery: window emit frequency
 *                         E) isGroupAll: If this is a Group By query with only metrics (one group result)
 *                         F) isStarSelect: If this query is a SELECT * query
 */
export default class QueryConverter {
  // BQL to Query methods

  static classifyBQL(select, groupBy) {
    // Group By
    if (!isEmpty(groupBy)) {
      return AGGREGATION_TYPES.GROUP;
    }
    if (COUNT_DISTINCT_TEST.test(select)) {
      return AGGREGATION_TYPES.COUNT_DISTINCT;
    }
    if (TOP_TEST.test(select)) {
      return AGGREGATION_TYPES.TOP_K;
    }
    if (QUANTILE_TEST.test(select) || FREQ_TEST.test(select) || CUMFREQ_TEST.test(select)) {
      return AGGREGATION_TYPES.DISTRIBUTION;
    }
    // Now that specials are done, if any functional and metric stuff is in the select, assume GROUP ALL
    if (FUNCTIONAL_TEST.test(select) && METRIC_TEST.test(select)) {
      return AGGREGATION_TYPES.GROUP;
    }
    return AGGREGATION_TYPES.RAW;
  }

  /**
   * Recreates a Ember Data like representation from a BQL query.
   * @param {Object} bql The String BQL query.
   * @return {Object} An Ember Object that looks like the Ember Data representation.
   */
  static recreateQuery(bql) {
    let result = bql.match(SQL);
    if (isEmpty(result)) {
      return null;
    }
    let query = EmberObject.create();
    // Ignore orderBy and having. Can throw error
    let { select, from, where, groupBy, windowing, limit } = result.groups;

    let type = QueryConverter.classifyBQL(select, groupBy);

    QueryConverter.recreateFilter(query, where);
    QueryConverter.recreateProjections(type, query, select);
    QueryConverter.recreateAggregation(type, query, select, groupBy, limit);
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

  static recreateProjections(type, query, select) {
    if (type !== AGGREGATION_TYPES.RAW || select.indexOf('*') !== -1) {
      return;
    }
    QueryConverter.setIfTruthy(query, 'projections', QueryConverter.recreateFields(select));
  }

  static recreateAggregation(type, query, select, groupBy, limit) {
    switch (type) {
      case AGGREGATION_TYPES.RAW:
        return QueryConverter.recreateRawAggregation(query, limit);
      case AGGREGATION_TYPES.COUNT_DISTINCT:
        return QueryConverter.recreateCountDistinctAggregation(query, select);
      case AGGREGATION_TYPES.GROUP:
        return QueryConverter.recreateGroupAggregation(query, select, groupBy);
      case AGGREGATION_TYPES.DISTRIBUTION:
        return QueryConverter.recreateDistributionAggregation(query, select);
      case AGGREGATION_TYPES.TOP_K:
        return QueryConverter.recreateTopKAggregation(query, select);
    }
  }

  static recreateRawAggregation(query, limit) {
    let aggregation = EmberObject.create();
    aggregation.set('type', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    if (!isEmpty(limit)) {
      aggregation.set('size', Number(limit));
    }
    query.set('aggregation', aggregation);
  }

  static recreateCountDistinctAggregation(query, select) {
    let aggregation = EmberObject.create();
    aggregation.set('type', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT));
    let result = select.match(COUNT_DISTINCT);
    let { fields, alias } = result.groups;
    let recreatedFields = QueryConverter.recreateFields(fields);
    QueryConverter.setIfTruthy(aggregation, 'groups', recreatedFields);
    if (!isEmpty(alias)) {
      let attributes = EmberObject.create();
      attributes.set('newName', QueryConverter.stripParentheses(alias));
      aggregation.set('attributes', attributes);
    }
    query.set('aggregation', aggregation);
  }

  static recreateGroupAggregation(query, select, groupBy) {
    let aggregation = EmberObject.create();
    aggregation.set('type', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP));
    let fields = QueryConverter.recreateFields(select);
    let groups = QueryConverter.recreateGroups(fields, groupBy);
    let metrics = QueryConverter.recreateMetrics(fields);
    QueryConverter.setIfTruthy(aggregation, 'groups', groups);
    QueryConverter.setIfTruthy(aggregation, 'metrics', metrics);
    query.set('aggregation', aggregation);
  }

  static recreateGroups(fields, groupBy) {
    let groups = QueryConverter.recreateFields(groupBy);
    // It isn't actually possible to Group By a set of fields and NOT have them in the select for the simple queries
    if (isEmpty(groups)) {
      return null;
    }
    // Add aliases if there were any
    groups.forEach(group => {
      let field = fields.findBy('field', group.get('field'));
      QueryConverter.setIfTruthy(group, 'name', field?.get('name'));
    });
    return groups;
  }

  static recreateMetrics(fields) {
    if (isEmpty(fields)) {
      return null;
    }
    // Field have things like SUM(foo) instead of foo. We need to correct it.
    let metrics = A();
    fields.forEach(metric => {
      let result = metric.get('field').match(FUNCTION);
      // Skip non-functions - probably group by fields
      if (!result) {
        return;
      }
      let { type, field } = result.groups;
      type = type.toUpperCase();
      metric.set('type', METRIC_TYPES.describe(METRIC_TYPES.forName(type)));
      metric.set('field', field);
      metrics.pushObject(metric);
    })
    return metrics;
  }

  static recreateDistributionAggregation(query, select) {
    let aggregation = EmberObject.create();
    aggregation.set('type', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION));
    let result = select.match(DISTRIBUTION);
    let { type, field, points } = result.groups;
    type = type.toUpperCase();

    let groups = A([EmberObject.create({ field: field })]);
    aggregation.set('groups', groups);

    let attributes = EmberObject.create();
    attributes.set('type', DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.forName(type)));

    let pointArray = points.split(',');
    let pointType = pointArray[0].toUpperCase();
    switch (pointType) {
      case 'LINEAR': {
        attributes.set('pointType', DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER));
        attributes.set('numberOfPoints', Number(pointArray[1]));
        break;
      }
      case 'MANUAL': {
        attributes.set('pointType', DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.POINTS));
        attributes.set('points', pointArray.slice(1).map(p => Number(p)).join(','));
        break;
      }
      case 'REGION': {
        attributes.set('pointType', DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.GENERATED));
        attributes.set('start', Number(pointArray[1]));
        attributes.set('end', Number(pointArray[2]));
        attributes.set('increment', Number(pointArray[3]));
        break;
      }
    }
    aggregation.set('attributes', attributes);
    query.set('aggregation', aggregation);
  }

  static recreateTopKAggregation(query, select) {
    let aggregation = EmberObject.create();
    aggregation.set('type', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K));

    let result = select.match(TOP_K);
    let { k, threshold, fields, alias, renames } = result.groups;

    aggregation.set('size', Number(k));

    let recreatedFields = QueryConverter.recreateFields(fields);
    let recreatedAliases = QueryConverter.recreateFields(renames);
    // If we have aliases, go through them and find the field for it and add the alias. Could do a map but not worth it
    if (!isEmpty(recreatedAliases)) {
      recreatedAliases.forEach(alias => {
        let field = recreatedFields.findBy('field', alias.get('field'));
        field.set('name', alias.get('name'));
      });
    }
    aggregation.set('groups', recreatedFields);

    let attributes = EmberObject.create();
    QueryConverter.setIfTruthy(attributes, 'threshold', threshold);
    QueryConverter.setIfTruthy(attributes, 'newName', QueryConverter.stripParentheses(alias));
    aggregation.set('attributes', attributes);
    query.set('aggregation', aggregation);
  }

  static recreateWindow(query, windowing) {
    if (isEmpty(windowing)) {
      return;
    }
    let result = windowing.match(TUMBLING);
    if (isEmpty(result)) {
      result = windowing.match(EVERY);
      if (isEmpty(result)) {
        return;
      }
    }
    let window = EmberObject.create();
    let { every, type, all } = result.groups;
    let emitEvery, emitType, includeType;

    type = type.toUpperCase();
    emitType = EMIT_TYPES.describe(type === EMIT_TYPES.identify(EMIT_TYPES.TIME) ? EMIT_TYPES.TIME : EMIT_TYPES.RECORD);
    emitEvery = Number(every);
    includeType = all ? INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL) : INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW);
    window.set('emitType', emitType);
    window.set('emitEvery', emitEvery);
    window.set('includeType', includeType);
    query.set('window', window);
  }

  static recreateDuration(query, from) {
    let result = from.match(STREAM).groups;
    if (!isEmpty(result) && result.duration) {
      query.set('duration', Number(result.duration));
    }
  }

  static recreateFields(fieldsString, fieldName = 'field', valueName = 'name') {
    if (isEmpty(fieldsString)) {
      return null;
    }
    let fields = A();
    let fieldsArray = fieldsString.split(',');
    fieldsArray.forEach(fieldString => {
      let field = QueryConverter.recreateField(fieldString, fieldName, valueName);
      if (QueryConverter.isTruthy(field)) {
        fields.pushObject(field);
      }
    });
    return fields;
  }

  static recreateField(fieldString, fieldName, valueName) {
    let result = fieldString.match(FIELD);
    let { name, alias } = result.groups;
    if (name == '*')  {
      return null;
    }
    return QueryConverter.makeField(fieldName, name, valueName, QueryConverter.stripParentheses(alias));
  }

  static makeField(fieldName, fieldValue, valueName, value) {
    let field = EmberObject.create();
    QueryConverter.setIfTruthy(field, fieldName, fieldValue);
    QueryConverter.setIfTruthy(field, valueName, value);
    return field;
  }

  static stripParentheses(alias) {
    if (!isEmpty(alias) && (alias.startsWith('"') || alias.startsWith('\''))) {
      return alias.slice(1, -1);
    }
    return alias;
  }

  static setIfTruthy(object, key, value) {
    if (QueryConverter.isTruthy(value)) {
      object.set(key, value);
    }
    return object;
  }

  static isTruthy(value) {
    // Also works for boolean false -> Object.keys(false) = []
    return !isEmpty(value) && Object.keys(value).length !== 0;
  }

  // Query to BQL methods

  static classifyQuery(aggregation) {
    return AGGREGATION_TYPES.forName(AGGREGATION_TYPES.name(aggregation.get('type')));
  }

  /**
   * Creates a BQL query from a Ember Data like representation.
   * @param {Object} query An Ember Object that looks like the Ember Data representation of a query.
   * @return {Object} A String BQL query.
   */
  static createBQL(query) {
    let aggregation = query.get('aggregation');
    let type = QueryConverter.classifyQuery(aggregation);

    // No need for HAVING or ORDER
    let select = QueryConverter.createSelect(type, query, aggregation);
    let from = QueryConverter.createFrom(query);
    let where = QueryConverter.createOptionalWhere(query.get('filter'));
    let groupBy = QueryConverter.createOptionalGroupBy(type, aggregation);
    let windowing = QueryConverter.createOptionalWindowing(query.get('window'));
    let limit = QueryConverter.createOptionalLimit(type, aggregation);
    // Optionals are responsible for adding a trailing space if they exist
    return `${select} ${from} ${where}${groupBy}${windowing}${limit}`;
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
    let duration = Number(query.get('duration'));
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
    if (isNone(window)) {
      return '';
    }
    let emitType = window.get('emitType');
    if (isEmpty(emitType)) {
      return '';
    }
    let type = EMIT_TYPES.name(emitType);
    let emitEvery = window.get('emitEvery');
    emitEvery = Number(emitEvery);
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

  // Categorization methods

  static categorizeBQL(bql) {
    // Returns { type: aggregation type, duration: query duration
    let categorization = EmberObject.create();
    let result = bql.match(SQL);
    if (!isEmpty(result)) {
      let { select, from, groupBy, windowing } = result.groups;
      let type = this.classifyBQL(select, groupBy);
      categorization.set('type', type);
      this.recreateDuration(categorization, from);
      this.categorizeWindow(categorization, windowing);
      categorization.set('isStarSelect', type === AGGREGATION_TYPES.RAW && select.indexOf('*') !== -1);
      categorization.set('isGroupAll', type === AGGREGATION_TYPES.GROUP && isEmpty(groupBy));
    }
    return categorization;
  }

  static categorizeWindow(categorization, windowing) {
    if (isEmpty(windowing)) {
      return;
    }
    let result = windowing.match(TUMBLING);
    if (isEmpty(result)) {
      result = windowing.match(EVERY);
      if (isEmpty(result)) {
        return;
      }
    }
    let { every, type } = result.groups;
    type = type.toUpperCase();
    categorization.set('emitType', type === EMIT_TYPES.identify(EMIT_TYPES.TIME) ? EMIT_TYPES.TIME : EMIT_TYPES.RECORD);
    categorization.set('emitEvery', Number(every));
  }
}

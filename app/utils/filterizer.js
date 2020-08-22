/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import isEmpty from 'bullet-ui/utils/is-empty';
import { MAP_ACCESSOR, MAP_FREEFORM_SUFFIX } from 'bullet-ui/utils/type';

export const MULTIPLE_VALUE_SEPARATOR = ',';

/**
 * This represents the empty clause better since the QueryBuilder displays nothing.
 * @type {Object}
 */
export const EMPTY_CLAUSE = { condition: 'AND', rules: [] }

/**
 * Responsible for converting between the formats of filter rules - QueryBuilder to and from API Query filter.
 */
export default class Filterizer {
  apiMode = true;

  setAPIMode(mode) {
    this.apiMode = mode;
  }

  /**
   * Converts an API filter clause to its QueryBuilder rule. Basic
   * filter clauses (no logical operation at the top level) will be
   * wrapped in an AND.
   * @param {Object} clause The API filter clause.
   * @return {Object} The corresponding QueryBuilder rule.
   */
  convertClauseToRule(clause) {
    let rule = this.convertClauseToRuleHelper(clause);
    if (this.isLogical(rule.condition)) {
      return rule;
    }
    return {
      condition: 'AND',
      rules: [rule]
    };
  }

  /**
   * Converts an API filter clause to its QueryBuilder rule. If a basic
   * filter clause (no logical operation at the top level), a basic rule will
   * be returned.
   * @private
   * @param {Object} clause The API filter clause.
   * @return {Object} The corresponding QueryBuilder rule.
   */
  convertClauseToRuleHelper(clause) {
    let operation = clause.operation;
    let rule = { };
    if (this.isLogical(operation)) {
      rule.condition = operation;
      rule.rules = this.convertClausesToRules(clause.clauses);
    } else {
      rule = this.convertFilterToRule(clause);
    }
    return rule;
  }

  /**
   * Converts a list of API filter clauses to their QueryBuilder rules.
   * @private
   * @param {Object} clauses The API filter clauses.
   * @return {Object} The corresponding QueryBuilder rules.
   */
  convertClausesToRules(clauses) {
    let converted = [];
    // This may or may not need to be an error
    if (isEmpty(clauses)) {
      return converted;
    }
    clauses.forEach(function(item) {
      converted.push(this.convertClauseToRuleHelper(item));
    }, this);
    return converted;
  }

  /**
   * Converts a Base API filter to a QueryBuilder rule. SubFields can only be handled if the filter was not generated
   * in apiMode since we cannot distinguish an enumerated subField from a free-form subField.
   * @private
   * @param {Object} filter The base API filter.
   * @return {Object} The corresponding QueryBuilder rule.
   */
  convertFilterToRule(filter) {
    let field = filter.field;
    let op = filter.operation;
    let values = filter.values;
    if (isEmpty(values)) {
      throw new Error(`No values found for ${JSON.stringify(filter)}`);
    }
    if (isEmpty(field)) {
      throw new Error(`No field found for ${JSON.stringify(filter)}`);
    }
    let rule = {
      id: field,
      field: field,
      value: values.join(MULTIPLE_VALUE_SEPARATOR)
    };
    // If we have a subField param set, subField separated field, set the field and subField again
    if (filter.subField && field.indexOf(MAP_ACCESSOR) !== -1) {
      let split = field.split(MAP_ACCESSOR);
      let fieldOnly = `${split[0]}${MAP_FREEFORM_SUFFIX}`;
      rule.id = fieldOnly;
      rule.field = fieldOnly;
      rule.subField = split[1];
    }

    if (op === '==') {
      if (this.isNull(rule.value)) {
        rule.operator = 'is_null';
        delete rule.value;
      } else if (this.isEmpty(rule.value)) {
        rule.operator = 'is_empty';
        delete rule.value;
      } else if (values.length === 1) {
        rule.operator = 'equal';
      } else {
        rule.operator = 'in';
      }
    } else if (op === '!=') {
      if (this.isNull(rule.value)) {
        rule.operator = 'is_not_null';
        delete rule.value;
      } else if (this.isEmpty(rule.value)) {
        rule.operator = 'is_not_empty';
        delete rule.value;
      } else if (values.length === 1) {
        rule.operator = 'not_equal';
      } else {
        rule.operator = 'not_in';
      }
    } else if (op === '>=') {
      rule.operator = 'greater_or_equal';
    } else if (op === '<=') {
      rule.operator = 'less_or_equal';
    } else if (op === '>') {
      rule.operator = 'greater';
    } else if (op === '<') {
      rule.operator = 'less';
    } else if (op === 'RLIKE') {
      rule.operator = 'rlike';
    } else {
      throw new Error(`Unknown operation: ${op} in filter: ${JSON.stringify(filter)}`);
    }
    return rule;
  }

  /**
   * Converts a QueryBuilder rule to an API clause. If a basic rule
   * (no logical operation at the top level), a basic filter clause
   * will be returned.
   * @param  {Object} rule A QueryBuilder specification of rules.
   * @return {Object} An API specification of the filters.
   */
  convertRuleToClause(rule) {
    let operation = rule.condition;
    let clause = { };

    if (this.isLogical(operation)) {
      clause.operation = operation;
      clause.clauses = this.convertRulesToClauses(rule.rules);
    } else {
      clause = this.convertRuleToFilter(rule);
    }
    return clause;
  }

  /**
   * Converts a list of QueryBuilder rules to their API filter clauses.
   * @private
   * @param  {Object} rules The QueryBuilder rules.
   * @return {Object} The corresponding API filter clauses.
   */
  convertRulesToClauses(rules) {
    let converted = [];
    // This may or may not need to be an error.
    if (isEmpty(rules)) {
      return converted;
    }
    rules.forEach(function(item) {
      converted.push(this.convertRuleToClause(item));
    }, this);
    return converted;
  }

  /**
   * Converts a QueryBuilder rule to a Base API filter.
   * @private
   * @param  {Object} filter The QueryBuilder rule.
   * @return {Object} The corresponding base API filter.
   */
  convertRuleToFilter(rule) {
    let op = rule.operator;
    let value = rule.value;
    let field = rule.field;
    let filter = {
      field: field,
      values: [value]
    };
    if (field && rule.subfield) {
      let index = rule.field.lastIndexOf(MAP_FREEFORM_SUFFIX);
      filter.field = `${field.substring(0, index)}${MAP_ACCESSOR}${rule.subfield}`;
      // We'll add this to make sure our inverse function works but only if we're not in apiMode
      if (!this.apiMode) {
        filter.subField = true;
      }
    }

    if (op === 'equal') {
      filter.operation = '==';
    } else if (op === 'in') {
      filter.operation = '==';
      filter.values = value.split(MULTIPLE_VALUE_SEPARATOR).map(i => i.trim());
    } else if (op === 'not_equal') {
      filter.operation = '!=';
    } else if (op === 'not_in') {
      filter.operation = '!=';
      filter.values = value.split(MULTIPLE_VALUE_SEPARATOR).map(i => i.trim());
    } else if (op === 'is_null') {
      filter.operation = '==';
      filter.values = ['NULL'];
    } else if (op === 'is_not_null') {
      filter.operation = '!=';
      filter.values = ['NULL'];
    } else if (op === 'is_empty') {
      filter.operation = '==';
      filter.values = [''];
    } else if (op === 'is_not_empty') {
      filter.operation = '!=';
      filter.values = [''];
    } else if (op === 'greater_or_equal') {
      filter.operation = '>=';
    } else if (op === 'less_or_equal') {
      filter.operation = '<=';
    } else if (op === 'greater') {
      filter.operation = '>';
    } else if (op === 'less') {
      filter.operation = '<';
    } else if (op === 'rlike') {
      filter.operation = 'RLIKE';
      filter.values = value.split(MULTIPLE_VALUE_SEPARATOR).map(i => i.trim());
    } else {
      throw new Error(`Unknown operator: ${op} in rule: ${JSON.stringify(rule)}`);
    }
    return filter;
  }

  isLogical(operation) {
    return operation === 'AND' || operation === 'OR' || operation === 'NOT';
  }

  isNull(value) {
    return value.toUpperCase() === 'NULL';
  }

  isEmpty(value) {
    return value === '';
  }
}

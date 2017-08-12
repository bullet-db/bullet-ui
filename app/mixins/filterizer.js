/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

// TODO: Clean this up and make it more sustainable for addition of new operations

/**
 * Responsible for converting between the formats of filter rules - QueryBuilder
 * to and from API Query filter.
 *
 * Add this mixin to any Object that requires to convert back and forth.
 */
export default Ember.Mixin.create({
  /**
   * The suffix that has been appended to fields that have free form subfields in the QueryBuilder rule.
   * Only needed to use methods that convert to the API format.
   * @type {String}
   */
  subfieldSuffix: '',
  /**
   * The separator to append to fields that have free form subfields when creating the API rule.
   * Only needed to use methods that convert to the API format.
   * @type {String}
   */
  subfieldSeparator: '',

  /**
   * The separator used to demarcate multiple values in a Querybuilder value.
   */
  multipleValueSeparator: ',',

  // This represents the empty clause better since the QueryBuilder displays nothing
  emptyClause: { condition: 'AND', rules: [] },

  /**
   * If in apiMode, all converted or created filters interoperate with strict API definition
   * If this is not true, additional metadata (subfield in particular) may be added for helping with some operations.
   */
  apiMode: true,

  /**
   * Converts an API filter clause to its QueryBuilder rule. Basic
   * filter clauses (no logical operation at the top level) will be
   * wrapped in an AND.
   * @param  {Object} clause The API filter clause.
   * @return {Object}        The corresponding QueryBuilder rule.
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
  },

  /**
   * Converts an API filter clause to its QueryBuilder rule. If a basic
   * filter clause (no logical operation at the top level), a basic rule will
   * be returned.
   * @private
   * @param  {Object} clause The API filter clause.
   * @return {Object}        The corresponding QueryBuilder rule.
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
  },

  /**
   * Converts a list of API filter clauses to their QueryBuilder rules.
   * @private
   * @param  {Object} clauses The API filter clauses.
   * @return {Object}         The corresponding QueryBuilder rules.
   */
  convertClausesToRules(clauses) {
    let converted = [];
    // This may or may not need to be an error
    if (Ember.isEmpty(clauses)) {
      return converted;
    }
    clauses.forEach(function(item) {
      converted.push(this.convertClauseToRuleHelper(item));
    }, this);
    return converted;
  },

  /**
   * Converts a Base API filter to a QueryBuilder rule. Subfields can only be handled if the filter was not generated
   * in apiMode since we cannot distinguish an enumerated subfield from a free-form subfield.
   * @private
   * @param  {Object} filter The base API filter.
   * @return {Object}        The corresponding QueryBuilder rule.
   */
  convertFilterToRule(filter) {
    let field = filter.field;
    let op = filter.operation;
    let values = filter.values;
    if (Ember.isEmpty(values)) {
      throw new Error(`No values found for ${filter}`);
    }
    if (Ember.isEmpty(field)) {
      throw new Error(`No field found for ${filter}`);
    }
    let rule = {
      id:  field,
      value: values.join(this.get('multipleValueSeparator'))
    };
    // If we have a subfield param set, subfield separated field, set the field and subfield again
    if (filter.subfield && field.indexOf(this.get('subfieldSeparator')) !== -1) {
      let split = field.split(this.get('subfieldSeparator'));
      rule.id = `${split[0]}${this.get('subfieldSuffix')}`;
      rule.subfield = split[1];
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
      throw new Error(`Unknown operation: ${op} in filter: ${filter}`);
    }
    return rule;
  },

  /**
   * Converts a QueryBuilder rule to an API clause. If a basic rule
   * (no logical operation at the top level), a basic filter clause
   * will be returned.
   * @private
   * @param  {Object} rule A QueryBuilder specification of rules.
   * @return {Object}      An API specification of the filters.
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
  },

  /**
   * Converts a list of QueryBuilder rules to their API filter clauses.
   * @private
   * @param  {Object} rules The QueryBuilder rules.
   * @return {Object}       The corresponding API filter clauses.
   */
  convertRulesToClauses(rules) {
    let converted = [];
    // This may or may not need to be an error.
    if (Ember.isEmpty(rules)) {
      return converted;
    }
    rules.forEach(function(item) {
      converted.push(this.convertRuleToClause(item));
    }, this);
    return converted;
  },

  /**
   * Converts a QueryBuilder rule to a Base API filter.
   * @private
   * @param  {Object} filter The QueryBuilder rule.
   * @return {Object}        The corresponding base API filter.
   */
  convertRuleToFilter(rule) {
    let op = rule.operator;
    let value = rule.value;
    let field = rule.field;
    let filter = {
      field:  field,
      values: [value]
    };
    if (field && rule.subfield) {
      let index = rule.field.lastIndexOf(this.get('subfieldSuffix'));
      filter.field = `${field.substring(0, index)}${this.get('subfieldSeparator')}${rule.subfield}`;
      // We'll add this to make sure our inverse function works but only if we're not in apiMode
      if (!this.get('apiMode')) {
        filter.subfield = true;
      }
    }

    if (op === 'equal') {
      filter.operation = '==';
    } else if (op === 'in') {
      filter.operation = '==';
      filter.values = value.split(this.get('multipleValueSeparator')).map(i => i.trim());
    } else if (op === 'not_equal') {
      filter.operation = '!=';
    } else if (op === 'not_in') {
      filter.operation = '!=';
      filter.values = value.split(this.get('multipleValueSeparator')).map(i => i.trim());
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
      filter.values = value.split(this.get('multipleValueSeparator')).map(i => i.trim());
    } else {
      throw new Error(`Unknown operator: ${op} in rule: ${rule}`);
    }
    return filter;
  },

  isLogical(operation) {
    return operation === 'AND' || operation === 'OR' || operation === 'NOT';
  },

  isNull(value) {
    return value.toUpperCase() === 'NULL';
  },

  isEmpty(value) {
    return value === '';
  }
});

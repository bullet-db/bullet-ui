/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

/*eslint camelcase: 0 */

import $ from 'jquery';
import { bind } from '@ember/runloop';
import isEmpty from 'bullet-ui/utils/is-empty';
import { getTypeClass, TYPE_CLASSES, MAP_ACCESSOR, MAP_FREEFORM_SUFFIX } from 'bullet-ui/utils/type';

export const SUBFIELD_ENABLED_KEY = 'show_subfield';

// Private constants
const EMPTY_CLAUSE = { condition: 'AND', rules: [] }
const IN_REGEX = /IN \s*\[(.+?)\]/ig;
const RLIKE_REGEX = /RLIKE \s*ANY\s+\[(.+?)\]/ig;
const SIZEIS_REGEX = /SIZEIS\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/ig;
const CONTAINSKEY_REGEX = /CONTAINSKEY\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/ig;
const CONTAINSVALUE_REGEX = /CONTAINSVALUE\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/ig;

// Storing as JSON string to quickly create a deep copy using JSON.parse
const TYPE_MAPPING = {
  [TYPE_CLASSES.PRIMITIVE_MAP]: JSON.stringify({
    type: 'string',
    placeholder: 'string',
    placeholders: { size_is: 'integer' },
    operators: ['size_is', 'contains_key', 'contains_value', 'is_null', 'is_not_null']
  }),
  [TYPE_CLASSES.PRIMITIVE_MAP_MAP]: JSON.stringify({
    type: 'string',
    placeholder: 'string',
    placeholders: { size_is: 'integer' },
    operators: ['size_is', 'contains_key', 'contains_value', 'is_null', 'is_not_null']
  }),
  [TYPE_CLASSES.PRIMITIVE_MAP_LIST]: JSON.stringify({
    type: 'string',
    placeholder: 'string',
    placeholders: { size_is: 'integer' },
    operators: ['size_is', 'contains_key', 'contains_value', 'is_null', 'is_not_null']
  }),
  [TYPE_CLASSES.PRIMITIVE_LIST]: JSON.stringify({
    type: 'integer',
    placeholder: 'integer',
    operators: ['size_is', 'is_null', 'is_not_null']
  }),
  [TYPE_CLASSES.PRIMITIVE]: {
    STRING: JSON.stringify({
      type: 'string',
      placeholder: 'string',
      placeholders: { size_is: 'integer', in: 'strings ( _, _, _, ..., _ )', not_in: 'strings ( _, _, _, ..., _ )', rlike: 'strings ( _, _, _, ..., _ )' },
      operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_empty', 'is_not_empty', 'is_null', 'is_not_null', 'size_is', 'rlike']
    }),
    INTEGER: JSON.stringify({
      type: 'integer',
      placeholder: 'integer', placeholders: { in: 'integers ( _, _, _, ..., _ )', not_in: 'integers ( _, _, _, ..., _ )' },
      operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_null', 'is_not_null']
    }),
    LONG: JSON.stringify({
      type: 'integer',
      placeholder: 'integer', placeholders: { in: 'integers ( _, _, _, ..., _ )', not_in: 'integers ( _, _, _, ..., _ )' },
      operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_null', 'is_not_null']
    }),
    FLOAT: JSON.stringify({
      type: 'double',
      placeholder: 'number', placeholders: { in: 'numbers ( _, _, _, ..., _ )', not_in: 'numbers ( _, _, _, ..., _ )' },
      operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_null', 'is_not_null']
    }),
    DOUBLE: JSON.stringify({
      type: 'double',
      placeholder: 'number', placeholders: { in: 'numbers ( _, _, _, ..., _ )', not_in: 'numbers ( _, _, _, ..., _ )' },
      operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_null', 'is_not_null']
    }),
    BOOLEAN: JSON.stringify({
      type: 'boolean', input: 'radio', values: { true: 'true', false: 'false' }
    })
  }
};

const OPTIONS = {
  allow_empty: true,
  plugins: {
    'bt-tooltip-errors': {
      delay: 0,
      placement: 'auto bottom'
    },
    'sortable': {
      icon: 'fa fa-ellipsis-v'
    },
    'sql-support': {
      'boolean_as_integer': false
    },
    'subfield': { },
    'placeholders': { }
  },
  fieldSuffixForSubfield: MAP_FREEFORM_SUFFIX,
  fieldSubfieldSeparator: MAP_ACCESSOR,
  // No need to support since rlike gets all of them:
  // 'ends_with', 'not_ends_with', 'between', 'not_between', 'begins_with', 'not_begins_with', 'contains', 'not_contains',
  operators: [
    'equal', 'not_equal', 'less', 'less_or_equal', 'is_empty',
    'is_not_empty', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_null', 'is_not_null',
    { type: 'size_is', nb_inputs: 1, multiple: false, apply_to: ['number'] },
    { type: 'contains_key', nb_inputs: 1, multiple: false, apply_to: ['string'] },
    { type: 'contains_value', nb_inputs: 1, multiple: false, apply_to: ['string'] },
    { type: 'rlike', nb_inputs: 1, multiple: false, apply_to: ['string'] }
  ],
  sqlOperators: {
    equal: { op: '= ?' },
    not_equal: { op: '!= ?' },
    in: { op: 'IN [?]' },
    not_in: { op: 'NOT IN [?]' },
    less: { op: '< ?' },
    less_or_equal: { op: '<= ?' },
    greater: { op: '> ?' },
    greater_or_equal: { op: '>= ?' },
    is_empty: { op: '= \'\'' },
    is_not_empty: { op: '!= \'\'' },
    is_null: { op: 'IS NULL' },
    is_not_null: { op: 'IS NOT NULL' },
    size_is: { op: 'SIZEIS($, ?)' },
    contains_key: { op: 'CONTAINSKEY($, ?)' },
    contains_value: { op: 'CONTAINSVALUE($, ?)' },
    rlike: { op: 'RLIKE ANY [?]' }
  },
  sqlRuleOperator: {
    // We need to make BQL look like valid SQL to allow the sql-parser to translate it. So we fake translate our
    // custom ops into this SQL when setting rules from SQL.
    'LIKE': (val) => {
      return { op: 'contains_key', val: val };
    },
    'ILIKE': (val) => {
      return { op: 'contains_value', val: val };
    },
    'REGEXP': (val) => {
      return { op: 'size_is', val: val };
    },
    'ANY': (val) => {
      return { op: 'rlike', val: val };
    }
  },
  icons: {
    add_group: 'fa fa-plus',
    add_rule: 'fa fa-plus',
    remove_group: 'fa fa-close',
    remove_rule: 'fa fa-close',
    error: 'fa fa-exclamation-circle'
  },
  // The non-empty strings are needed!
  lang: {
    add_rule: 'Rule',
    add_group: 'Group',
    delete_rule: ' ',
    delete_group: ' ',
    operators: {
      size_is: 'size is',
      contains_key: 'contains key',
      contains_value: 'contains value',
      rlike: 'regex matches'
    }
  }
};

function isMultipleOperator(operator) {
  return ['in', 'not_in', 'rlike'].includes(operator);
}

function isFunctionOperator(operator) {
  return ['size_is', 'contains_key', 'contains_value'].includes(operator);
}

function isSizeIs(operator) {
  return operator === 'size_is';
}

/**
 * Creates a QueryBuilder filter from a {@link Column}.
 * @private
 * @param {String} name The name of the field.
 * @param {String} type The type of the field.
 * @param {Symbol} typeClass The type class of the field.
 * @param {Boolean} hasSubField Whether this field has a subField or not.
 * @return {Object} The QueryBuilder filter.
 */
function rulify(name, type, typeClass, hasSubField = false) {
  let filter = TYPE_MAPPING[typeClass];
  if (typeClass === TYPE_CLASSES.PRIMITIVE) {
    filter = filter[type];
  }
  // Native implementation of JSON.parse is faster than jQuery extend to make a copy of the object
  filter = JSON.parse(filter);
  filter.id = name;
  if (hasSubField) {
    filter.id = `${name}${MAP_FREEFORM_SUFFIX}`;
    filter[SUBFIELD_ENABLED_KEY] = true;
  }
  return filter;
}

// This takes a BQL where clause content and translates it to a format that the QueryBuilder can load SQL from.
function preProcessBQL(bql) {
  let result = bql;
  // This handles both IN and NOT IN
  result = result.replace(IN_REGEX, 'IN ($1)');
  // ANY needs to match with the sqlRuleOperator defined for RLIKE
  result = result.replace(RLIKE_REGEX, 'ANY ($1)');
  // REGEXP needs to match with the sqlRuleOperator defined for SIZEIS
  result = result.replace(SIZEIS_REGEX, '$1 REGEXP $2');
  // LIKE needs to match with the sqlRuleOperator defined for CONTAINSKEY
  result = result.replace(CONTAINSKEY_REGEX, '$1 LIKE $2');
  // ILIKE needs to match with the sqlRuleOperator defined for CONTAINSVALUE
  result = result.replace(CONTAINSVALUE_REGEX, '$1 ILIKE $2');
  return result;
}

// This fixes quotes for strings vs numbers in multiple operators inputs
// It also makes proper function calls out of the function operators
function fixSQLForRule(event, rule, value, sqlFunction) {
  // Any changer applied for the getSQLField event is discarded unfortunately so have to recompute it
  // Necessary for our own subField changer
  let field = event.builder.change('getSQLField', rule.field, rule);
  let operator = rule.operator;
  if (isMultipleOperator(operator)) {
    // Strip leading and trailing quote and add them around each. This is not added based on the rule.type but
    // rather the type of the value itself inside querybuilder.
    let values = value.slice(1, value.length - 1).split(',')
    value = values.map(v => {
      return rule.type === 'string' ? `'${v}'` : v;
    }).join(',');
    event.value = `${field} ${sqlFunction(value)}`;
  } else if (isFunctionOperator(operator)) {
    // We put a different special character $ to be replaced with the field
    let fieldLess = sqlFunction(value);
    event.value = fieldLess.replace('$', field);
  }
}

// This fixes all multiple operators to have a string input instead of number (since even numeric fields can have ,)
// It also fixes the size_is operator to have a numeric input type
function fixRuleInput(event, rule) {
  let operator = rule.operator.type;
  if (isMultipleOperator(operator)) {
    event.value = event.value.replace('type="number"', 'type="text"');
  } else if (isSizeIs(operator)) {
    event.value = event.value.replace('type="text"', 'type="number"');
  }
}

// This exists to fix values that get set to non-strings when in, not in or rlike is used with no comma
// Also fixes size_is to be numbers
function fixRuleValue(event, rule) {
  let value = rule.value;
  if (value === undefined) {
    return;
  }
  let operator = rule.operator.type;
  if (typeof value === 'string') {
    // Force the type to number if it's a string . Will call this recursively like below but ends immediately
    if (isSizeIs(operator)) {
      rule.value = Number(value);
    }
    return;
  }
  if (isMultipleOperator(rule.operator.type)) {
    // Force type to string for initial value even if input type is changed by fixRuleInput
    // Needs to be rule not event. This triggers a recursive call that will end immediately.
    rule.value = String(value);
  }
}

// This turns off the not a number validation for multiple operators
// This turns on number validation for the the size_is operator
function fixValidation(event, value, rule) {
  let operator = rule.operator.type;
  let result = event.value;
  // Force ok: not valid, non-string, number errors for in or rlike rules
  if (result !== true && result.indexOf('number_nan') !== -1 && rule.type !== 'string' && isMultipleOperator(operator)) {
    event.value = true;
  } else if (result === true && isSizeIs(operator)) {
    if (isNaN(value)) {
      event.value = ['number_nan'];
    } else if (parseInt(value) != value) {
      event.value = ['number_not_integer'];
    } else if (parseInt(value) < 0) {
      event.value = ['number_exceed_min', -1];
    }
  }
}

// This finds the filter matching given field for a field that had a freeform subfield. Only called when not found so
// can assume it's a freeform subfield
function findFieldForRule(event) {
  let field = event.value;
  let fieldPrefix = field.slice(0, field.lastIndexOf(MAP_ACCESSOR));
  event.value = `${fieldPrefix}${MAP_FREEFORM_SUFFIX}`;
}

/**
 * Creates QueryBuilder version of Filters from an Enumerable of {@link Column}, flattening enumerated Columns.
 * @param {Column} columns An Enumerable set of Columns
 * @return {Array} Array of the corresponding filters.
 */
export function builderFilters(columns) {
  let filters = [];
  if (isEmpty(columns)) {
    return filters;
  }
  return columns.reduce((previous, item) => {
    let flattenedColumns = item.flattenedColumns;
    return previous.concat(flattenedColumns.map(flatColumn => {
      return rulify(flatColumn.name, flatColumn.type, getTypeClass(flatColumn.type), flatColumn.isSubField);
    }));
  }, filters);
}

/**
 * Given a JQuery Element and options, adds the QueryBuilder to it.
 * @param {JQueryElement} element The JQuery element to add the QueryBuilder to.
 * @param {object} filters Filters for the builder.
 */
export function addQueryBuilder(element, filters) {
  let options = OPTIONS;
  options.filters = filters;
  // This needs to be bound BEFORE the querybuilder is initialized to create inputs with the right types
  element.on('getRuleInput.queryBuilder.filter', bind(this, fixRuleInput));
  element.on('afterUpdateRuleValue.queryBuilder', bind(this, fixRuleValue));
  element.queryBuilder(options);
  element.on('ruleToSQL.queryBuilder.filter', bind(this, fixSQLForRule));
  element.on('validateValue.queryBuilder.filter', bind(this, fixValidation));
  element.on('getSQLFieldID.queryBuilder.filter', bind(this, findFieldForRule));
}

/**
 * Given a JQuery Element with the QueryBuilder, adds the given rules from previous rules or from bql to it.
 * @param {JQueryElement} element The JQuery Element with the QueryBuilder.
 * @param {object} rules The initial rules to add.
 * @param {string} bql The BQL to use if rules are not present.
 */
export function addQueryBuilderRules(element, rules, bql) {
  if (!isEmpty(rules)) {
    element.queryBuilder('setRules', rules);
  } else if (!isEmpty(bql)) {
    element.queryBuilder('setRulesFromSQL', preProcessBQL(bql));
  } else {
    element.queryBuilder('setRules', EMPTY_CLAUSE);
  }
}

/**
 * Given a JQuery Element with the QueryBuilder, adds the relevant hooks for dirty and validation.
 * @param {object} context The this context for use for the hooks.
 * @param {function} dirtyHook The hook to invoke whenever something changes in the QueryBuilder.
 * @param {function} validateHook The hook to invoke for validation when something changes in the QueryBuilder.
 */
export function addQueryBuilderHooks(element, context, dirtyHook, validateHook) {
  element.on('rulesChanged.queryBuilder', bind(context, dirtyHook));
  let event = [
    'afterUpdateRuleFilter.queryBuilder',
    'afterUpdateRuleOperator.queryBuilder',
    'afterUpdateRuleSubfield.queryBuilder',
    'afterUpdateRuleValue.queryBuilder'
  ];
  element.on(event.join(' '), bind(context, validateHook));
}

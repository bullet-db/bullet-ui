/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

/*eslint camelcase: 0 */

import { bind } from '@ember/runloop';
import isEmpty from 'bullet-ui/utils/is-empty';
import { MAP_ACCESSOR, MAP_FREEFORM_SUFFIX } from 'bullet-ui/utils/type';

export const SUBFIELD_ENABLED_KEY = 'show_subfield';

const INTEGER_MAPPING = JSON.stringify({
  type: 'integer',
  placeholder: 'integer', placeholders: { in: 'integers ( _, _, _, ..., _ )', not_in: 'integers ( _, _, _, ..., _ )' },
  operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_null', 'is_not_null']
});
const FLOAT_MAPPING = JSON.stringify({
  type: 'double',
  placeholder: 'number', placeholders: { in: 'numbers ( _, _, _, ..., _ )', not_in: 'numbers ( _, _, _, ..., _ )' },
  operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_null', 'is_not_null']
});

// Storing as JSON string to quickly create a deep copy using JSON.parse
const TYPE_MAPPING = {
  // MAPs and LISTs will map to UNDEFINED
  UNDEFINED: JSON.stringify({
    type: 'integer',
    operators: ['is_null', 'is_not_null']
  }),
  types: {
    STRING: JSON.stringify({
      type: 'string',
      placeholder: 'string', placeholders: { in: 'strings ( _, _, _, ..., _ )', not_in: 'strings ( _, _, _, ..., _ )', rlike: 'strings ( _, _, _, ..., _ )' },
      operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_empty', 'is_not_empty', 'is_null', 'is_not_null', 'rlike']
    }),
    INTEGER: INTEGER_MAPPING,
    LONG: INTEGER_MAPPING,
    FLOAT: FLOAT_MAPPING,
    DOUBLE: FLOAT_MAPPING,
    BOOLEAN: JSON.stringify({
      type: 'boolean', input: 'radio', values: { true: 'true', false: 'false' }
    })
  }
};

const MULTIPLE_OPERATORS = ['in', 'not_in', 'rlike'];

/**
 * Returns the default options for QueryBuilder. Does not include filters.
 * @return {Object} The Options to configure QueryBuilder
 */
export function builderOptions() {
  return {
    allow_empty: true,
    plugins: {
      'bt-tooltip-errors': {
        delay: 0,
        placement: 'auto bottom'
      },
      'sortable': {
        icon: 'fa fa-ellipsis-v'
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
      { type: 'rlike', nb_inputs: 1, multiple: false, apply_to: ['string'] }
    ],
    sqlOperators: {
      equal: { op: '= ?' },
      not_equal: { op: '!= ?' },
      in: { op: '= ANY [?]' },
      not_in: { op: '!= ALL [?]' },
      less: { op: '< ?' },
      less_or_equal: { op: '<= ?' },
      greater: { op: '> ?' },
      greater_or_equal: { op: '>= ?' },
      is_empty: { op: '= \'\'' },
      is_not_empty: { op: '!= \'\'' },
      is_null: { op: 'IS NULL' },
      is_not_null: { op: 'IS NOT NULL' },
      rlike: { op: 'RLIKE ANY [?]' }
    },
    sqlRuleOperator: {
      'RLIKE ANY': (val) => {
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
        rlike: 'regex matches'
      }
    }
  };
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
      return rulify(flatColumn.name, flatColumn.type, flatColumn.isSubField);
    }));
  }, filters);
}

/**
 * Given a JQuery Element and options, adds the QueryBuilder to it.
 * @param {JQueryElement} element The JQuery element to add the QueryBuilder to.
 * @param {[type]} options Initial options for the builder.
 */
export function addQueryBuilder(element, options) {
  // This needs to be bound BEFORE the querybuilder is initialized to create inputs with the right types
  element.on('getRuleInput.queryBuilder.filter', bind(this, fixRuleInput));
  element.on('afterUpdateRuleValue.queryBuilder', bind(this, fixRuleValue));
  element.queryBuilder(options);
  element.on('ruleToSQL.queryBuilder.filter', bind(this, fixSQLForRule));
  element.on('validateValue.queryBuilder.filter', bind(this, fixValidation));
}

/**
 * Given a JQuery Element with the QueryBuilder, adds the relevant hooks for dirty and validation.
 * @param {[type]} context The this context for use for the hooks.
 * @param {[type]} dirtyHook The hook to invoke whenever something changes in the QueryBuilder.
 * @param {[type]} validateHook The hook to invoke for validation when something changes in the QueryBuilder.
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

/**
 * Creates a QueryBuilder filter from a {@link Column}.
 * @private
 * @param {String} name The name of the field.
 * @param {String} type The type of the field.
 * @param {Boolean} hasSubField Whether this field has a subField or not.
 * @return {Object} The QueryBuilder filter.
 */
function rulify(name, type, hasSubField = false) {
  let filter = TYPE_MAPPING.types[`${type}`];
  // Native implementation of JSON.parse is faster than jQuery extend to make a copy of the object
  filter = JSON.parse(filter ? filter : TYPE_MAPPING.UNDEFINED);
  filter.id = name;
  if (hasSubField) {
    filter.id = `${name}${MAP_FREEFORM_SUFFIX}`;
    filter[SUBFIELD_ENABLED_KEY] = true;
  }
  return filter;
}

function isMultipleOperator(operator) {
  return MULTIPLE_OPERATORS.includes(operator);
}

function fixSQLForRule(event, rule, value, sqlFunction) {
  if (isMultipleOperator(rule.operator)) {
    // Strip leading and trailing quote and add them around each. This is not added based on the rule.type but
    // rather the type of the value itself inside querybuilder.
    let values = value.slice(1, value.length - 1).split(',')
    value = values.map(v => {
      return rule.type === 'string' ? `'${v}'` : v;
    }).join(',');
    // Any changer applied for the getSQLField event is discarded unfortunately so have to recompute it
    // Necessary for our own subField changer
    let field = event.builder.change('getSQLField', rule.field, rule);
    event.value = `${field}  ${sqlFunction(value)}`;
  }
}

function fixRuleInput(event, rule) {
  if (isMultipleOperator(rule.operator.type)) {
    event.value = event.value.replace('type="number"', 'type="text"');
  }
}

// This exists to fix values that get set to non-strings when in or rlike is used with no comma
function fixRuleValue(event, rule) {
  let value = rule.value;
  if (value === undefined || typeof value === 'string') {
    return;
  }
  if (isMultipleOperator(rule.operator.type)) {
    // Force type to string for initial value even if input type is changed by fixRuleInput
    // Needs to be rule not event. This triggers a recursive call that will end immediately.
    rule.value = String(value);
  }
}

function fixValidation(event, value, rule) {
  let operator = rule.operator.type;
  let result = event.value;
  // Force ok: not valid, non-string, number errors for in or rlike rules
  if (result !== true && result.indexOf('number_nan') !== -1 && rule.type !== 'string' && isMultipleOperator(operator)) {
    event.value = true;
  }
}

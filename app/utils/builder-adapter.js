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

/**
 * Maps types to their QueryBuilder rule flags.
 * @private
 * @type {Object}
 */

const INTEGER_MAPPING = JSON.stringify({
  type: 'integer',
  placeholder: 'integer', placeholders: { in: 'integers ( _, _, _, ..., _ )' },
  operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'is_null', 'is_not_null']
});

const FLOAT_MAPPING = JSON.stringify({
  type: 'double',
  placeholder: 'number', placeholders: { in: 'numbers ( _, _, _, ..., _ )' },
  operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'is_null', 'is_not_null']
});

const TYPE_MAPPING = {
  // Storing as JSON string to quickly create a deep copy using JSON.parse
  UNDEFINED: JSON.stringify({
    type: 'integer',
    operators: ['is_null', 'is_not_null']
  }),

  // MAPs and LISTs will map to UNDEFINED
  types: {
    STRING: JSON.stringify({
      type: 'string',
      placeholder: 'string', placeholders: { in: 'strings ( _, _, _, ..., _ )', rlike: 'strings ( _, _, _, ..., _ )' },
      operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'is_empty', 'is_not_empty', 'is_null', 'is_not_null', 'rlike']
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

/**
 * Provides methods to configure the QueryBuilder plugin with initial filters and options, given
 * an Enumerable of {@link Column}.
 */

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
      'is_not_empty', 'greater', 'greater_or_equal', 'in', 'is_null', 'is_not_null',
      { type: 'rlike', nb_inputs: 1, multiple: false, apply_to: ['string'] }
    ],
    sqlOperators: {
      equal: { op: '= ?' },
      not_equal: { op: '!= ?' },
      in: { op: 'IN [?]' },
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

export function addQueryBuilder(element, options, context, dirtyHook, validateHook) {
  // This needs to be bound BEFORE the querybuilder is initialized to create inputs with the right types
  element.on('getRuleInput.queryBuilder.filter', bind(this, fixRuleValue));
  element.queryBuilder(options);
  element.on('rulesChanged.queryBuilder', bind(context, dirtyHook));
  let event = [
    'afterUpdateRuleFilter.queryBuilder',
    'afterUpdateRuleOperator.queryBuilder',
    'afterUpdateRuleSubfield.queryBuilder',
    'afterUpdateRuleValue.queryBuilder'
  ];
  element.on(event.join(' '), bind(context, validateHook));
  element.on('ruleToSQL.queryBuilder.filter', bind(this, fixSQLForRule));
  element.on('validateValue.queryBuilder.filter', bind(this, fixValidation));
}

function fixSQLForRule(event, rule, value, sqlFunction) {
  let operator = rule.operator;
  if (operator === 'in' || operator === 'rlike') {
    // Strip leading and trailing quote and add them around each. This is not added based on the rule.type but
    // rather the type of the value itself inside querybuilder.
    let values = value.slice(1, value.length - 1).split(',')
    value = values.map(v => {
      return rule.type === 'string' ? `'${v}'` : v;
    }).join(',');
  }
  // Any changer applied for the getSQLField event is discarded unfortunately
  event.value = `${rule.field}  ${sqlFunction(value)}`;
}

function fixRuleValue(event, rule) {
  let template = event.value;
  let operator = rule.operator.type;
  if (rule.type !== 'string' && (operator === 'in' || operator === 'rlike')) {
    event.value = template.replace('type="number"', 'type="text"');
  }
}

function fixValidation(event, value, rule) {
  let operator = rule.operator.type;
  let result = event.value;
  // Force ok for not valid, non-string, in or rlike rules
  if (result !== true && rule.type !== 'string' && (operator === 'in' || operator === 'rlike')) {
    event.value = true;
  }
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

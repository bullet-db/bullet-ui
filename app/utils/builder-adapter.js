/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

/*eslint camelcase: 0 */

import isEmpty from 'bullet-ui/utils/is-empty';
import { MAP_ACCESSOR, MAP_FREEFORM_SUFFIX } from 'bullet-ui/utils/type';

export const SUBFIELD_ENABLED_KEY = 'show_subfield';

/**
 * Maps types to their QueryBuilder rule flags.
 * @private
 * @type {Object}
 */
const TYPE_MAPPING = {
  // Storing as JSON string to quickly create a deep copy using JSON.parse
  UNDEFINED: JSON.stringify({
    type: 'integer',
    operators: ['is_null', 'is_not_null']
  }),

  // MAP and LIST will map to UNDEFINED
  types: {
    STRING: JSON.stringify({
      type: 'string',
      placeholder: 'string', placeholders: { in: 'strings ( _, _, _, ..., _ )', not_in: 'strings ( _, _, _, ..., _ )', rlike: 'strings ( _, _, _, ..., _ )' },
      operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'in', 'not_in', 'is_empty', 'is_not_empty', 'is_null', 'is_not_null', 'rlike']
    }),

    LONG: JSON.stringify({
      type: 'integer',
      placeholder: 'integer', placeholders: { in: 'integers ( _, _, _, ..., _ )', not_in: 'integers ( _, _, _, ..., _ )' },
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
      'equal', 'not_equal', 'in', 'not_in', 'less', 'less_or_equal', 'is_empty',
      'is_not_empty', 'greater', 'greater_or_equal', 'is_null', 'is_not_null',
      { type: 'rlike', nb_inputs: 1, multiple: false, apply_to: ['string'] }
    ],
    sqlOperators: {
      equal: { op: '= ?' },
      not_equal: { op: '!= ?' },
      in: { op: 'IN(?)',     sep: ', ' },
      not_in: { op: 'NOT IN(?)', sep: ', ' },
      less: { op: '< ?' },
      less_or_equal: { op: '<= ?' },
      greater: { op: '> ?' },
      greater_or_equal: { op: '>= ?' },
      is_empty: { op: '= \'\'' },
      is_not_empty: { op: '!= \'\'' },
      is_null: { op: 'IS NULL' },
      is_not_null: { op: 'IS NOT NULL' },
      rlike: { op: 'RLIKE ?' }
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

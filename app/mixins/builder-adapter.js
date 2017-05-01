/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import Filterizer from 'bullet-ui/mixins/filterizer';

/**
 * Provides methods to configure the QueryBuilder plugin with initial filters and options, given
 * an Enumerable of {@link Column}.
 */
export default Ember.Mixin.create(Filterizer, {
  /**
   * Returns the default options for QueryBuilder. Does not include filters.
   * @return {Object} The Options to configure QueryBuilder
   */
  builderOptions() {
    return {
      allow_empty: true,
      plugins: {
        'bt-tooltip-errors': {
          delay: 0,
          placement: 'auto bottom'
        },
        'sortable':  {
          icon: 'glyphicon glyphicon-option-vertical'
        },
        'subfield': { },
        'placeholders': { }
      },
      fieldSuffixForSubfield: this.get('subfieldSuffix'),
      fieldSubfieldSeparator: this.get('subfieldSeparator'),
      // No need to support since rlike gets all of them:
      // 'ends_with', 'not_ends_with', 'between', 'not_between', 'begins_with', 'not_begins_with', 'contains', 'not_contains',
      operators: [
        'equal', 'not_equal', 'in', 'not_in', 'less', 'less_or_equal', 'is_empty',
        'is_not_empty', 'greater', 'greater_or_equal', 'is_null', 'is_not_null',
        { type: 'rlike', nb_inputs: 1, multiple: false, apply_to: ['string'] }
      ],
      sqlOperators: {
        equal:            { op: '= ?' },
        not_equal:        { op: '!= ?' },
        in:               { op: 'IN(?)',     sep: ', ' },
        not_in:           { op: 'NOT IN(?)', sep: ', ' },
        less:             { op: '< ?' },
        less_or_equal:    { op: '<= ?' },
        greater:          { op: '> ?' },
        greater_or_equal: { op: '>= ?' },
        is_empty:         { op: '= \'\'' },
        is_not_empty:     { op: '!= \'\'' },
        is_null:          { op: 'IS NULL' },
        is_not_null:      { op: 'IS NOT NULL' },
        rlike:            { op: 'RLIKE ?' }
      },
      icons: {
        add_group: 'glyphicon glyphicon-plus',
        add_rule: 'glyphicon glyphicon-plus',
        remove_group: 'glyphicon glyphicon-remove',
        remove_rule: 'glyphicon glyphicon-remove',
        error: 'glyphicon glyphicon-exclamation-sign'
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
  },

  /**
   * Creates QueryBuilder version of Filters from an Enumerable of {@link Column}, flattening enumerated Columns.
   * @param  {Column} columns An Enumerable set of Columns
   * @return {Ember.Array}    Ember Arrray of the corresponding filters.
   */
  builderFilters(columns) {
    let filters = Ember.A();
    if (Ember.isEmpty(columns)) {
      return filters;
    }
    return columns.reduce((previous, item) => {
      let flattenedColumns = item.get('flattenedColumns');
      return previous.addObjects(flattenedColumns.map((flatColumn) => {
        return this.rulify(flatColumn.name, flatColumn.type, flatColumn.hasFreeformField);
      }));
    }, filters);
  },

  /**
   * Creates a QueryBuilder filter from a {@link Column}.
   * @private
   * @param  {String}  name        The name of the field.
   * @param  {String}  type        The type of the field.
   * @param  {Boolean} hasSubfield Whether this field has a subfield or not.
   * @return {Object}              The QueryBuilder filter.
   */
  rulify(name, type, hasSubfield = false) {
    let filter = this.get(`typeMapping.types.${type}`);
    // Native implementation of JSON.parse is faster than jQuery extend to make a copy of the object
    filter = JSON.parse(filter ? filter : this.get('typeMapping.UNDEFINED'));
    filter.id = name;
    if (hasSubfield) {
      filter.id = `${name}${this.get('subfieldSuffix')}`;
      filter.show_subfield = true;
    }
    return filter;
  },

  /**
   * Maps types to their QueryBuilder rule flags.
   * @private
   * @type {Object}
   */
  typeMapping:  {
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
  }
});

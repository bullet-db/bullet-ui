/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['column-field'],

  initialValue: null,
  columns: null,
  selectedColumn: null,
  subfield: null,
  subfieldKey: null,
  subfieldSuffix: null,
  subfieldSeparator: null,
  disabled: false,

  subfieldEnabled: computed('selectedColumn', 'subfieldKey', function() {
    return this.get(`selectedColumn.${this.subfieldKey}`);
  }).readOnly(),

  /** Reverse mapping from ids back to the columns for easy lookup. **/
  columnMapping: computed('columns.[]', function() {
    return this.columns.reduce((previous, current) => {
      previous[current.id] = current;
      return previous;
    }, {});
  }).readOnly(),

  didReceiveAttrs() {
    this._super(...arguments);
    let selection = this.selectedColumn;
    let initialValue = this.initialValue;
    // didInsertElement doesn't seem to be called when the values above are present, so we
    // want to make the following behave like a constructor - i.e. set only once at the beginning.
    if (isEmpty(selection) && !isEmpty(initialValue)) {
      let { field, subfield } = this.findField(initialValue);
      this.setField(field, subfield);
    }
  },

  compositeField: computed('selectedColumn', 'subfield', function() {
    let top = this.get('selectedColumn.id');
    let sub = this.subfield;
    let suffixPosition = top.lastIndexOf(this.subfieldSuffix);
    if (suffixPosition === -1) {
      return top;
    }
    let mainField = top.substring(0, suffixPosition);
    if (isEmpty(sub)) {
      return mainField;
    }
    return `${mainField}${this.subfieldSeparator}${sub}`;
  }).readOnly(),

  sliceToLastSeparator(name) {
    let lastSeparator = name.lastIndexOf(this.subfieldSeparator);
    return lastSeparator !== -1 ? name.slice(0, lastSeparator) : name;
  },

  sliceFromLastSeparator(name) {
    let lastSeparator = name.lastIndexOf(this.subfieldSeparator);
    return lastSeparator !== -1 ? name.slice(lastSeparator + 1) : name;
  },

  findField(name) {
    // Not using Ember get if mainField contains a '.'
    let field = this.columnMapping[name];
    let subfield = '';
    // If we didn't find the full field, it is a field with a subfield
    if (isEmpty(field)) {
      let mainField = `${this.sliceToLastSeparator(name)}${this.subfieldSuffix}`;
      field = this.columnMapping[mainField];
      subfield = this.sliceFromLastSeparator(name);
    }
    return { field: EmberObject.create(field), subfield: subfield };
  },

  setField(field, subfield) {
    this.set('selectedColumn', field);
    this.set('subfield', subfield);
  },

  actions: {
    handleSelect(column) {
      // Clear out subfield when field changes
      this.setField(column, '');
      this.onDone(this.compositeField);
    },

    handleFocusOut() {
      this.onDone(this.compositeField);
    }
  }
});

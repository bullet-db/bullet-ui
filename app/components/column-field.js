/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['column-field'],

  initialValue: null,
  columns: null,
  selectedColumn: null,
  subfield: null,
  subfieldKey: null,
  subfieldSuffix: null,
  subfieldSeparator: null,
  disabled: false,

  subfieldEnabled: Ember.computed('selectedColumn', 'subfieldKey', function() {
    return this.get(`selectedColumn.${this.get('subfieldKey')}`);
  }).readOnly(),

  /** Reverse mapping from ids back to the columns for easy lookup. **/
  columnMapping: Ember.computed('columns.[]', function() {
    return this.get('columns').reduce((previous, current) => {
      previous[current.id] = current;
      return previous;
    }, {});
  }).readOnly(),

  didReceiveAttrs() {
    this._super(...arguments);
    let selection = this.get('selectedColumn');
    let initialValue = this.get('initialValue');
    // didInsertElement doesn't seem to be called when the values above are present, so we
    // want to make the following behave like a constructor - i.e. set only once at the beginning.
    if (Ember.isEmpty(selection) && !Ember.isEmpty(initialValue)) {
      let { field, subfield } = this.findField(initialValue);
      this.setField(field, subfield);
    }
  },

  compositeField: Ember.computed('selectedColumn', 'subfield', function() {
    let top = this.get('selectedColumn.id');
    let sub = this.get('subfield');
    let suffixPosition = top.lastIndexOf(this.get('subfieldSuffix'));
    if (suffixPosition === -1) {
      return top;
    }
    let mainField = top.substring(0, suffixPosition);
    if (Ember.isEmpty(sub)) {
      return mainField;
    }
    return `${mainField}${this.get('subfieldSeparator')}${sub}`;
  }).readOnly(),

  sliceToLastSeparator(name) {
    let lastSeparator = name.lastIndexOf(this.get('subfieldSeparator'));
    return lastSeparator !== -1 ? name.slice(0, lastSeparator) : name;
  },

  sliceFromLastSeparator(name) {
    let lastSeparator = name.lastIndexOf(this.get('subfieldSeparator'));
    return lastSeparator !== -1 ? name.slice(lastSeparator + 1) : name;
  },

  findField(name) {
    // Not using Ember get if mainField contains a '.'
    let field = this.get('columnMapping')[name];
    let subfield = '';
    // If we didn't find the full field, it is a field with a subfield
    if (Ember.isEmpty(field)) {
      let mainField = `${this.sliceToLastSeparator(name)}${this.get('subfieldSuffix')}`;
      field = this.get('columnMapping')[mainField];
      subfield = this.sliceFromLastSeparator(name);
    }
    return { field: Ember.Object.create(field), subfield: subfield };
  },

  setField(field, subfield) {
    this.set('selectedColumn', field);
    this.set('subfield', subfield);
  },

  actions: {
    handleSelect(column) {
      // Clear out subfield when field changes
      this.setField(column, '');
      this.get('onDone')(this.get('compositeField'));
    },

    handleFocusOut() {
      this.get('onDone')(this.get('compositeField'));
    }
  }
});

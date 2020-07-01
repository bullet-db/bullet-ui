/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import EmberObject, { action, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class ColumnFieldComponent extends Component {
  @tracked selectedColumn;
  @tracked subfield;

  constructor() {
    super(...arguments);
    let initialValue = this.args.initialValue;
    if (!isEmpty(initialValue)) {
      let { field, subfield } = this.findField(initialValue);
      this.setField(field, subfield);
    }
  }

  get subfieldEnabled() {
    return this.selectedColumn && this.selectedColumn[this.args.subfieldKey];
  }

  // Reverse mapping from ids back to the columns for easy lookup
  @computed('args.columns.[]')
  get columnMapping() {
    console.log('triggered');
    return this.columns.reduce((previous, current) => {
      previous[current.id] = current;
      return previous;
    }, {});
  }

  @computed('selectedColumn', 'subfield')
  get compositeField() {
    let top = this.selectedColumn.id;
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
  }

  sliceToLastSeparator(name) {
    let lastSeparator = name.lastIndexOf(this.subfieldSeparator);
    return lastSeparator !== -1 ? name.slice(0, lastSeparator) : name;
  }

  sliceFromLastSeparator(name) {
    let lastSeparator = name.lastIndexOf(this.subfieldSeparator);
    return lastSeparator !== -1 ? name.slice(lastSeparator + 1) : name;
  }

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
    return { field, subfield };
  }

  setField(field, subfield) {
    this.selectedColumn = field;
    this.subfield = subfield;
  }

  @action
  onSelect(column) {
    // Clear out subfield when field changes
    this.setField(column, '');
    this.args.onDone(this.compositeField);
  }

  @action
  onFocusOut() {
    this.args.onDone(this.compositeField);
  }
}

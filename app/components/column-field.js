/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { MAP_ACCESSOR } from 'bullet-ui/utils/type';
import { FREEFORM_SUFFIX, SUBFIELD_ENABLED_KEY } from 'bullet-ui/utils/builder-adapter';

export default class ColumnFieldComponent extends Component {
  @tracked selectedColumn;
  @tracked subField;

  constructor() {
    super(...arguments);
    let initialValue = this.args.initialValue;
    if (!isEmpty(initialValue)) {
      let { field, subField } = this.findField(initialValue);
      this.setField(field, subField);
    }
  }

  get subFieldEnabled() {
    return this.selectedColumn && this.selectedColumn[SUBFIELD_ENABLED_KEY];
  }

  // Reverse mapping from ids back to the columns for easy lookup
  get columnMapping() {
    return this.args.columns.reduce((previous, current) => {
      previous[current.id] = current;
      return previous;
    }, {});
  }

  get compositeField() {
    let top = this.selectedColumn.id;
    let sub = this.subField;
    let suffixPosition = top.lastIndexOf(FREEFORM_SUFFIX);
    if (suffixPosition === -1) {
      return top;
    }
    let mainField = top.substring(0, suffixPosition);
    if (isEmpty(sub)) {
      return mainField;
    }
    return `${mainField}${MAP_ACCESSOR}${sub}`;
  }

  sliceToLastSeparator(name) {
    let lastSeparator = name.lastIndexOf(MAP_ACCESSOR);
    return lastSeparator !== -1 ? name.slice(0, lastSeparator) : name;
  }

  sliceFromLastSeparator(name) {
    let lastSeparator = name.lastIndexOf(MAP_ACCESSOR);
    return lastSeparator !== -1 ? name.slice(lastSeparator + 1) : name;
  }

  findField(name) {
    // Not using Ember get if mainField contains a '.'
    let field = this.columnMapping[name];
    let subField = '';
    // If we didn't find the full field, it is a field with a subField
    if (isEmpty(field)) {
      let mainField = `${this.sliceToLastSeparator(name)}${FREEFORM_SUFFIX}`;
      field = this.columnMapping[mainField];
      subField = this.sliceFromLastSeparator(name);
    }
    return { field, subField };
  }

  setField(field, subField) {
    this.selectedColumn = field;
    this.subField = subField;
  }

  @action
  onSelect(column) {
    // Clear out subField when field changes
    this.setField(column, '');
    this.args.onDone(this.compositeField);
  }

  @action
  onFocusOut() {
    this.args.onDone(this.compositeField);
  }
}

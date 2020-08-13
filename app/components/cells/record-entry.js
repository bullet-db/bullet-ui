/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';
import { isEmpty, typeOf } from '@ember/utils';
import CloseablePopoverComponent from 'bullet-ui/components/closeable-popover';

export default class RecordEntryComponent extends CloseablePopoverComponent {
  @tracked hasPopover;

  constructor() {
    super(...arguments);
    this.hasPopover = !isEmpty(this.data);
  }

  get label() {
    return get(this.args.column, 'label');
  }

  get data() {
    // Deliberately not using Ember get to prevent '.' expansion
    return get(this.args.row, 'content')[this.label];
  }

  get isComplex() {
    let type = typeOf(this.data);
    return type === 'object' || type === 'array';
  }

  get textValue() {
    let data = this.data;
    return this.isComplex ? JSON.stringify(data) : data;
  }

  get formattedValue() {
    let data = this.data;
    return this.isComplex ? JSON.stringify(data, null, 2) : data;
  }
}

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { isEmpty, typeOf } from '@ember/utils';

export default class RecordEntryComponent extends Component {
  @tracked hasPopover;
  @tracked showingPopover;

  constructor() {
    super(...arguments);
    this.hasPopover = !isEmpty(this.data);
    this.showingPopover = false;
  }

  willDestroy() {
    this.showingPopover = false;
  }

  get popperOptions() {
    return {
      modifiers: {
        preventOverflow: {
          escapeWithReference: false
        }
      }
    };
  }

  get label() {
    return this.args.column.get('label');
  }

  get data() {
    // Deliberately not using Ember get to prevent '.' expansion
    return this.args.row.get('content')[this.label];
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

  @action
  closePopover() {
    this.showingPopover = false;
  }

  @action
  showPopover() {
    this.showingPopover = true;
  }
}

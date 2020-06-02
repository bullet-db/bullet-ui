/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { get } from '@ember/object';

export default class ValidatedInputComponent extends Component {
  get type() {
    return this.args.type || 'text';
  }

  get forceDirty() {
    return this.args.forceDirty || false;
  }

  get disabled() {
    return this.args.disabled || false;
  }

  get tooltipPosition() {
    return this.args.tooltipPosition || 'right';
  }

  get placeholder() {
    return this.args.placeholder || '';
  }

  get fieldName() {
    return this.args.fieldName || '';
  }

  get valuePath() {
    return this.args.valuePath || '';
  }

  get value() {
    return get(this.args.model, this.valuePath);
  }

  get isInvalid() {
    let validations = get(this.args.model, 'validation.attrs');
    console.log(validations);
    return false;
  //   let isValidating = get(validations, `${this.valuePath}.isValidating`) || false;
  //   console.log(isValidating);
  //   let isDirty = get(validations, 'isDirty') || this.args.forceDirty;
  //   console.log(isDirty);
  //   let isInvalid = get(validations, 'isInvalid') || false;
  //   console.log(isInvalid);
  //   console.log(!isValidating && isDirty && isInvalid);
  //   return !isValidating && isDirty && isInvalid;
  }
}

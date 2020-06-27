/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';

export default class ValidatedInputComponent extends Component {
  get type() {
    return this.args.type || 'text';
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

  get isInvalid() {
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

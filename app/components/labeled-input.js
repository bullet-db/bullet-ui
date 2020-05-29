/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

export default class LabeledInputComponent extends Component {
  id;

  constructor() {
    super(...arguments);
    this.id = `${guidFor(this)}-${this.args.fieldName}`;
  }

  get type() {
    return this.args.type || 'text';
  }

  get disabled() {
    return this.args.disabled || false;
  }

  get maxlength() {
    return this.args.maxlength || 30;
  }
}

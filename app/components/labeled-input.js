/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import argsGet from 'bullet-ui/utils/args-get';

export default class LabeledInputComponent extends Component {
  id;

  constructor() {
    super(...arguments);
    this.id = `${guidFor(this)}-${this.args.label}`;
  }

  get maxLength() {
    return argsGet(this.args, 'maxlength', 30);
  }

  @action
  onChange(event) {
    this.args.onChange && this.args.onChange(event.target.value);
  }
}

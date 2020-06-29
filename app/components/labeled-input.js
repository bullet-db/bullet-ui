/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class LabeledInputComponent extends Component {
  id;

  constructor() {
    super(...arguments);
    this.id = `${guidFor(this)}-${this.args.label}`;
  }

  @action
  onChange(event) {
    this.args.onChange(event.target.value);
  }
}

/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { action } from '@ember/object';
import ValidatedInputComponent from 'bullet-ui/components/validated-input';

const MS = 1000;

export default class ValidatedTimeInputComponent extends ValidatedInputComponent {
  get value() {
    return this.args.changeset.get(this.args.valuePath) / MS;
  }

  set value(value) {
    // Need to specify empty setter again
  }

  @action
  onChange(value) {
    super.onChange(Number(value) * MS);
  }
}

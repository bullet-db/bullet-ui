/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class ValidatedInputComponent extends Component {
  @tracked isInvalid = false;

  get tooltipPosition() {
    return this.args.tooltipPosition || 'right';
  }

  @action
  onChange(value) {
    let changeset = this.args.changeset;
    let path = this.args.valuePath;
    changeset.set(path, value);
    changeset.validate(path).then(() => {
      let isInvalid = changeset.get('isInvalid');
      let fieldHasError = !isEmpty(changeset.get(`error.${valuePath}`));
      this.isInvalid = isInvalid && fieldHasError;
    });
  }
}

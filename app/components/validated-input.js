/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import argsGet from 'bullet-ui/utils/args-get';

export default class ValidatedInputComponent extends Component {
  @tracked isInvalid = false;
  @tracked errors;

  constructor() {
    super(...arguments);
    this.validate();
  }

  get tooltipPosition() {
    return argsGet(this.args, 'tooltipPosition', 'right');
  }

  @action
  validate() {
    let changeset = this.args.changeset;
    let path = this.args.valuePath;
    changeset.validate(path).then(() => {
      if (!changeset.get('isInvalid')) {
        this.isInvalid = false;
        return;
      }
      let errors = changeset.get(`error.${path}`);
      this.isInvalid = !isEmpty(errors);
      this.errors = errors;
    });
  }

  @action
  onChange(value) {
    this.args.changeset.set(this.args.valuePath, value);
    this.validate();
  }
}

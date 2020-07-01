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

export default class ValidatedFieldSelectionComponent extends Component {
  @tracked isInvalid = false;
  valuePath = 'field';

  get tooltipPosition() {
    return argsGet(this.args, 'tooltipPosition', 'right');
  }

  get disableField() {
    return argsGet(this.args, 'disableField', false);
  }

  get enableRenaming() {
    return argsGet(this.args, 'enableRenaming', true);
  }

  get enableDeleting() {
    return argsGet(this.args, 'enableDeleting', true);
  }

  @action
  onModify(field) {
    let changeset = this.args.changeset;
    changeset.set('field', field);
    changeset.set('name', '');
    changeset.validate().then(() => {
      let isInvalid = changeset.get('isInvalid');
      let fieldHasError = !isEmpty(changeset.get(`error.${this.valuePath}`));
      this.isInvalid = isInvalid && fieldHasError;
    });
  }

  @action
  onDelete() {
    this.args.onDelete();
  }
}

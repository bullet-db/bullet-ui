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
  @tracked errors;
  fieldPath = 'field';
  namePath = 'name';

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
  onModifyField(field) {
    let changeset = this.args.changeset;
    changeset.set(this.fieldPath, field);
    changeset.set(this.namePath, '');
    changeset.validate().then(() => {
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
  onModifyName(name) {
    let changeset = this.args.changeset;
    changeset.set(this.namePath, name);
    // No need to validate name
  }

  @action
  onDelete() {
    this.args.onDelete();
  }
}

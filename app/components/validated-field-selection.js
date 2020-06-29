/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class ValidatedFieldSelectionComponent extends Component {
  @tracked isInvalid = false;
  valuePath = 'field';

  get tooltipPosition() {
    return this.args.tooltipPosition || 'right';
  }

  @action
  modifyField(field) {
    let changeset = this.args.changeset;
    this.args.fieldModified(field);
    changeset.validate().then(() => {
      let isInvalid = changeset.get('isInvalid');
      let fieldHasError = !isEmpty(changeset.get(`error.${this.valuePath}`));
      this.isInvalid = isInvalid && fieldHasError;
    });
  }

  @action
  deleteClicked() {
    this.args.fieldDeleted();
  }
}

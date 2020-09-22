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

  get enableAdditionalOptions() {
    return argsGet(this.args, 'enableAdditionalOptions', false);
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

  async validate(changeset, path) {
    await changeset.validate();
    if (!changeset.get('isInvalid')) {
      this.isInvalid = false;
      return;
    }
    let errors = changeset.get(`error.${path}`);
    this.isInvalid = !isEmpty(errors);
    this.errors = errors;
  }

  @action
  async validateAll() {
    let changeset = this.args.changeset;
    await changeset.validate();
    if (!changeset.get('isInvalid')) {
      this.isInvalid = false;
      return;
    }
    let paths = [this.args.additionalPath, this.fieldPath, this.namePath];
    let errors = paths.filter(path => !isEmpty(path)).flatMap(path => changeset.get(`error.${path}.validation`));
    this.isInvalid = !isEmpty(errors);
    this.errors = { validation: errors };
  }

  @action
  onModifyAdditionalOption(option) {
    let changeset = this.args.changeset;
    let path = this.args.additionalPath;
    changeset.set(path, option);
    this.args.onChange();
    this.validate(changeset, path);
  }

  @action
  onModifyField(field) {
    let changeset = this.args.changeset;
    let path = this.fieldPath;
    changeset.set(path, field);
    changeset.set(this.namePath, '');
    this.args.onChange();
    this.validate(changeset, path);
  }

  @action
  onModifyName(name) {
    let changeset = this.args.changeset;
    changeset.set(this.namePath, name);
    this.args.onChange();
    this.validate(changeset, this.namePath);
  }

  @action
  onDelete() {
    this.args.onDelete();
  }
}

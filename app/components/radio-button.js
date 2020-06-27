/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, computed, get } from '@ember/object';
import { equal, or, not } from '@ember/object/computed';
import { isEqual } from '@ember/utils';

export default class RadioButtonComponent extends Component {
  get checked() {
    return isEqual(this.args.value, this.args.checkedValue);
  }

  @action
  onChange() {
    this.args.updated(this.args.value);
    this.args.changed();
  }
}

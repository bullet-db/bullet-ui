/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { not } from '@ember/object/computed';

export default class ModeToggleComponent extends Component {
  @tracked isToggled;
  @not('isToggled') isNotToggled;

  constructor() {
    super(...arguments);
    this.reset();
  }

  @action
  reset() {
    this.isToggled = this.args.isToggled;
  }

  @action
  onToggle() {
    this.isToggled = !this.isToggled;
    this.args.onToggle(this.isToggled);
  }
}

/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CloseablePopoverComponent extends Component {
  @tracked showingPopover;

  constructor() {
    super(...arguments);
    this.showingPopover = false;
  }

  get popperOptions() {
    return { modifiers: { preventOverflow: { escapeWithReference: false } } };
  }

  @action
  showPopover() {
    this.showingPopover = true;
  }

  @action
  closePopover() {
    this.showingPopover = false;
  }
}

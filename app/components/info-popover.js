/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import argsGet from 'bullet-ui/utils/args-get';

export default class InfoPopoverComponent extends Component {
  get popperOptions() {
    return { modifiers: { preventOverflow: { escapeWithReference: false } } };
  }

  get isButton() {
    return argsGet(this.args, 'isButton', true);
  }

  get side() {
    return argsGet(this.args, 'side', 'right');
  }

  get additionalText() {
    return argsGet(this.args, 'additionalText', '');
  }
}

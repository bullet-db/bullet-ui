/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import argsGet from 'bullet-ui/utils/args-get';

export default class DateEntryComponent extends Component {
  get format() {
    return argsGet(this.args, 'format', 'DD MMM hh:mm A');
  }
}

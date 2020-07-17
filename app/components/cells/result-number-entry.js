/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ResultNumberEntryComponent extends Component {
  @action
  onClick() {
    this.args.tableActions.resultClick(this.args.row);
  }
}

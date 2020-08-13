/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryDateEntryComponent extends Component {
  @action
  onClick() {
    let result = this.args.value;
    if (result) {
      this.args.tableActions.resultClick(result);
    }
  }
}

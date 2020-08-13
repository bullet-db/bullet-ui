/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryShareableLinkComponent extends Component {
  get queryLink() {
    return this.args.row.get('queryLink');
  }

  get queryID() {
    let id = this.args.row.get('content.id');
    return `query-${id}`;
  }

  get queryIDSelector() {
    return `#${this.queryID}`;
  }

  @action
  collapse() {
    this.args.row.set('expanded', false);
  }
}

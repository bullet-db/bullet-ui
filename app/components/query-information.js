/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class QueryInformationComponent extends Component {
  @service querier;
  @alias('querier.isRunningQuery') isRunningQuery;

  @action
  cancelClick(event) {
    event.stopPropagation();
    this.args.cancelClick();
  }

  @action
  reRunClick(event) {
    event.stopPropagation();
    this.args.reRunClick();
  }

  @action
  queryClick(event) {
    event.stopPropagation();
    this.args.queryClick();
  }
}

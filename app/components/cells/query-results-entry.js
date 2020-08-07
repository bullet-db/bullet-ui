/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CloseablePopoverComponent from 'bullet-ui/components/closeable-popover';

export default class QueryResultsEntryComponent extends CloseablePopoverComponent {
  @tracked hasPopover;

  constructor() {
    super(...arguments);
    this.hasPopover = this.args.value.length > 0;
  }

  @action
  deleteResultsClick() {
    this.hasPopover = false;
    this.args.tableActions.deleteResultsClick(this.args.row);
  }

  @action
  resultClick(result) {
    this.args.tableActions.resultClick(result);
  }
}

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class QueryResultsEntryComponent extends Component {
  @tracked hasPopover;
  @tracked showingPopover;

  constructor() {
    super(...arguments);
    this.hasPopover = this.args.value.length > 0;
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

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class QueryNameEntryComponent extends Component {
  @tracked hasHover = false;

  @action
  onMouseEnter() {
    this.hasHover = true;
  }

  @action
  onMouseLeave() {
    this.hasHover = false;
  }

  @action
  onClick(event) {
    event.preventDefault();
    this.args.tableActions.queryClick(this.args.row);
  }

  @action
  onCopyClick(event) {
    event.preventDefault();
    this.args.tableActions.copyQueryClick(this.args.row);
  }

  @action
  onLinkClick() {
    event.preventDefault();
    this.args.tableActions.linkQueryClick(this.args.row);
  }

  @action
  onDeleteClick(event) {
    event.preventDefault();
    this.args.tableActions.deleteQueryClick(this.args.row);
  }
}

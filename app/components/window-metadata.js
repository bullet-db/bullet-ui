/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class WindowMetadataComponent extends Component {
  @tracked expanded = false;

  @action
  onToggleExpanded(event) {
    event.stopPropagation();
    this.expanded = !this.expanded;
  }
}

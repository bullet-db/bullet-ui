/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { action, computed } from '@ember/object';

const SPACING = 4;
const MAX_LEVELS = 3;

export default class RecordsRawViewerComponent extends Component {
  @tracked isToggled = true;

  get numberOflevels() {
    let rows = this.args.data.length;
    return Math.max(1, parseInt((MAX_LEVELS - (rows / 20))));
  }

  @computed('args.data')
  get formattedData() {
    let data = this.args.data;
    if (isEmpty(data)) {
      return '';
    }
    return JSON.stringify(data, null, SPACING);
  }

  @action
  onToggle(value) {
    this.isToggled = value;
  }
}

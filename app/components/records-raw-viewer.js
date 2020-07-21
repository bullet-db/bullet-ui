/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';

const SPACING = 4;
const MAX_LEVELS = 3;
// For each multiple of this in rows, we want to decrease that many default expansions from MAX_LEVELS
const ROW_COUNT_LEVEL_BREAK = 20;

export default class RecordsRawViewerComponent extends Component {
  @tracked isToggled = true;

  get numberOflevels() {
    let rows = this.args.data.length;
    return Math.max(1, parseInt((MAX_LEVELS - (rows / ROW_COUNT_LEVEL_BREAK))));
  }

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

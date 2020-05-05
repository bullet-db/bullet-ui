/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['records-raw-viewer'],
  isToggled: true,
  spacing: 4,
  data: null,
  maxlevels: 3,

  numberOflevels: computed('data', 'maxLevels', function() {
    let rows = this.get('data.length');
    let max = this.maxlevels;
    return Math.max(1, parseInt((max - (rows / 20))));
  }).readOnly(),

  formattedData: computed('data', function() {
    let data = this.data;
    if (isEmpty(data)) {
      return '';
    }
    return JSON.stringify(data, null, parseFloat(this.spacing));
  }).readOnly()
});

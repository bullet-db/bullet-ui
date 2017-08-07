/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['records-raw-viewer'],
  isToggled: true,
  spacing: 4,
  data: null,

  formattedData:  Ember.computed('data', function() {
    let data = this.get('data');
    if (Ember.isEmpty(data)) {
      return '';
    }
    return JSON.stringify(data, null, parseFloat(this.get('spacing')));
  }).readOnly()
});

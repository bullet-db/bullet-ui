/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['query-date-entry'],

  click() {
    let result = this.get('value');
    if (result) {
      this.get('tableActions.resultClick')(result);
    }
  }
});

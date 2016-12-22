/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import RowComponent from 'ember-light-table/components/lt-row';

export default RowComponent.extend({
  classNameBindings: ['hasEnumerations'],

  hasEnumerations: Ember.computed('row', function() {
    return this.get('row.hasEnumerations');
  })
});

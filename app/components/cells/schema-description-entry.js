/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['schema-description-entry'],
  tagName: 'span',

  // As the user of this UI, you are expected to make sure any html in the description is safe.
  htmlSafeValue: Ember.computed('value', function() {
    return Ember.String.htmlSafe(this.get('value'));
  })
});

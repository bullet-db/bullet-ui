/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['schema-description-entry'],
  tagName: 'span',

  // As the user of this UI, you are expected to make sure any html in the description is safe.
  htmlSafeValue: computed('value', function() {
    return htmlSafe(this.value);
  })
});

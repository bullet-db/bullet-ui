/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['labeled-input'],
  fieldName: null,
  fieldValue: null,
  type: 'text',
  placeholder: null,
  disabled: false,
  maxlength: 30
});

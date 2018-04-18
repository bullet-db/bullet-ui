/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { defineProperty } from '@ember/object';
import { not, or, and, alias } from '@ember/object/computed';
import Component from '@ember/component';

// Adapted from the dummy app validated-input in
// https://github.com/offirgolan/ember-cp-validations
export default Component.extend({
  classNames: ['validated-input'],
  classNameBindings: ['isInvalid:has-error'],
  inputClassNames: '',
  model: null,
  fieldName: '',
  valuePath: '',
  type: 'text',
  placeHolder: '',
  tooltipPosition: 'right',
  forceDirty: false,
  disabled: false,
  // Defined properties in init
  value: null,
  validation: null,

  notValidating: not('validation.isValidating'),
  isDirty: or('validation.isDirty', 'forceDirty'),
  isInvalid: and('notValidating', 'isDirty', 'validation.isInvalid'),

  init() {
    this._super(...arguments);
    let valuePath = this.get('valuePath');
    defineProperty(this, 'validation', alias(`model.validations.attrs.${valuePath}`));
    defineProperty(this, 'value', alias(`model.${valuePath}`));
  }
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

// Adapted from the dummy app validated-input in
// https://github.com/offirgolan/ember-cp-validations
export default Ember.Component.extend({
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

  notValidating: Ember.computed.not('validation.isValidating'),
  isDirty: Ember.computed.or('validation.isDirty', 'forceDirty'),
  isInvalid: Ember.computed.and('notValidating', 'isDirty', 'validation.isInvalid'),

  init() {
    this._super(...arguments);
    let valuePath = this.get('valuePath');
    Ember.defineProperty(this, 'validation', Ember.computed.alias(`model.validations.attrs.${valuePath}`));
    Ember.defineProperty(this, 'value', Ember.computed.alias(`model.${valuePath}`));
  }
});

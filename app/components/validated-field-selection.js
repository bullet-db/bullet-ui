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
  classNames: ['row field-selection-container validated-field-selection'],
  classNameBindings: ['isInvalid:has-error'],
  columns: null,
  model: null,
  tooltipPosition: 'right',
  forceDirty: false,
  validation: null,
  valuePath: 'field',
  subfieldSuffix: '',
  subfieldSeparator: '',
  fieldClasses: '',
  nameClasses: '',
  disabled: false,
  enableRenaming: true,
  enableDeleting: true,

  notValidating: not('validation.isValidating'),
  isDirty: or('validation.isDirty', 'forceDirty'),
  isInvalid: and('notValidating', 'isDirty', 'validation.isInvalid'),

  init() {
    this._super(...arguments);
    let valuePath = this.valuePath;
    defineProperty(this, 'validation', alias(`model.validations.attrs.${valuePath}`));
  },

  actions: {
    modifyField(field) {
      this.sendAction('fieldModified', field);
    },

    deleteClicked() {
      this.sendAction('deleteModel');
    }
  }
});

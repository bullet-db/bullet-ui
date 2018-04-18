/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { next } from '@ember/runloop';
import { isEmpty, typeOf } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';
import ElementPopover from 'bullet-ui/mixins/element-popover';

export default Component.extend(ElementPopover, {
  classNames: ['record-entry'],
  classNameBindings: ['hasPopover:has-popover'],
  row: null,
  column: null,
  value: null,
  isActive: false,
  // ElementPopover properties
  titleElement: '.record-popover-title',
  bodyElement: '.record-popover-body',
  placeOn: 'bottom',
  additionalClass: 'record-entry-popover',

  data: computed('row', 'column', function() {
    let columnName = this.get('column.label');
    // Deliberately not using Ember get to prevent '.' expansion
    return this.get('row.content')[columnName];
  }).readOnly(),

  hasPopover: computed('data', function() {
    return !isEmpty(this.get('data'));
  }).readOnly(),

  isComplex: computed('data', function() {
    let type = typeOf(this.get('data'));
    return type === 'object' || type === 'array';
  }).readOnly(),

  textValue: computed('isComplex', 'data', function() {
    let data = this.get('data');
    return this.get('isComplex') ? JSON.stringify(data) : data;
  }).readOnly(),

  formattedValue: computed('isComplex', 'data', function() {
    let data = this.get('data');
    return this.get('isComplex') ? JSON.stringify(data, null, 2) : data;
  }).readOnly(),

  willDestroyElement() {
    this._super(...arguments);
    this.removePopover();
  },

  click() {
    this.set('isActive', true);
    next(() => {
      this.getPopover().popover('toggle');
    });
  },

  actions: {
    closePopover() {
      this.getPopover().popover('hide');
    }
  }
});

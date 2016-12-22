/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import ElementPopover from 'bullet-ui/mixins/element-popover';

export default Ember.Component.extend(ElementPopover, {
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

  data: Ember.computed('row', 'column', function() {
    let columnName = this.get('column.label');
    // Deliberately not using Ember get to prevent '.' expansion
    return this.get('row.content')[columnName];
  }).readOnly(),

  hasPopover: Ember.computed('data', function() {
    return !Ember.isEmpty(this.get('data'));
  }).readOnly(),

  isComplex: Ember.computed('data', function() {
    let type = Ember.typeOf(this.get('data'));
    return type === 'object' || type === 'array';
  }).readOnly(),

  textValue: Ember.computed('isComplex', 'data', function() {
    let data = this.get('data');
    return this.get('isComplex') ? JSON.stringify(data) : data;
  }).readOnly(),

  formattedValue: Ember.computed('isComplex', 'data', function() {
    let data = this.get('data');
    return this.get('isComplex') ? JSON.stringify(data, null, 2) : data;
  }).readOnly(),

  willDestroyElement() {
    this._super(...arguments);
    this.removePopover();
  },

  click() {
    this.set('isActive', true);
    Ember.run.next(() => {
      this.getPopover().popover('toggle');
    });
  },

  actions: {
    closePopover() {
      this.getPopover().popover('hide');
    }
  }
});

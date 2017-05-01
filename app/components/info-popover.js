/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import ElementPopover from 'bullet-ui/mixins/element-popover';

export default Ember.Component.extend(ElementPopover, {
  classNames: ['info-popover-wrapper'],
  isButton: true,
  buttonClasses: 'glyphicon glyphicon-info-sign',
  additionalText: '',
  title: '',

  // ElementPopover properties
  titleElement: '.popover-title',
  bodyElement: '.popover-contents',
  placeOn: 'right',
  triggering: 'focus',
  additionalClass: 'info-popover',

  didInsertElement() {
    this._super(...arguments);
    this.getPopover();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.removePopover();
  }
});

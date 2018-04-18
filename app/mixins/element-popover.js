/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  titleElement: '',
  bodyElement: '',
  additionalClass: '',
  createOn: '.popover-wrapper',
  placeOn: 'bottom',
  triggering: 'manual',
  hasHtml: true,
  createdPopover: false,

  removePopover() {
    if (this.get('createdPopover')) {
      this.$().popover('destroy');
      this.set('createdPopover', false);
    }
  },

  getPopover() {
    let element = this.$();
    if (this.get('createdPopover')) {
      return element;
    }
    let { titleElement, bodyElement, createOn, placeOn, triggering, additionalClass, hasHtml } =
      this.getProperties('titleElement', 'bodyElement', 'createOn', 'placeOn', 'triggering', 'additionalClass', 'hasHtml');
    let popoverTitleElement = this.$(titleElement);
    let popoverBodyElement = this.$(bodyElement);
    this.$().popover({
      title: popoverTitleElement.html(),
      content: popoverBodyElement,
      container: createOn,
      placement: placeOn,
      trigger: triggering,
      html: hasHtml
    }).on('show.bs.popover', () => {
      popoverBodyElement.removeClass('hidden');
    }).data('bs.popover').tip().addClass(additionalClass);
    this.set('createdPopover', true);
    return element;
  }
});

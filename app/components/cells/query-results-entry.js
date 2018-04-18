/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { computed } from '@ember/object';
import Component from '@ember/component';
import ElementPopover from 'bullet-ui/mixins/element-popover';

export default Component.extend(ElementPopover, {
  classNames: ['query-results-entry'],
  classNameBindings: ['hasPopover:has-popover'],
  // ElementPopover properties
  titleElement: '.query-results-entry-popover-title',
  bodyElement: '.query-results-entry-popover-body',
  placeOn: 'left',
  additionalClass: 'query-results-entry-popover',

  hasPopover: computed('value', function() {
    return this.get('value.length') > 0;
  }),

  willDestroyElement() {
    this._super(...arguments);
    this.removePopover();
  },

  click() {
    if (this.get('hasPopover')) {
      this.set('renderTable', true);
      this.getPopover().popover('toggle');
    }
  },

  actions: {
    closePopover() {
      this.getPopover().popover('hide');
    },

    deleteResultsClick() {
      this.removePopover();
      this.set('hasPopover', false);
      this.get('tableActions.deleteResultsClick')(this.get('row'));
    },

    resultClick(result) {
      this.get('tableActions.resultClick')(result);
    }
  }
});

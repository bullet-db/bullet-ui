/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { computed } from '@ember/object';
import $ from 'jquery';
import Component from '@ember/component';
import { debounce } from '@ember/runloop';

export default Component.extend({
  rows: null,
  initialOptions: null,

  init() {
    this._super(...arguments);
    this.set('defaultOptions', {
      unusedAttrsVertical: true,
      menuLimit: 200,
      renderers: $.extend(
        $.pivotUtilities.renderers,
        $.pivotUtilities.c3_renderers,
        $.pivotUtilities.export_renderers
      )
    });
  },

  options: computed('initialOptions', 'defaultOptions', function() {
    let deserialized = this.get('initialOptions');
    let options = this.get('defaultOptions');
    // Attach refresh handler
    return $.extend({ onRefresh: this.refreshHandler(this) }, deserialized, options);
  }),

  didInsertElement() {
    this._super(...arguments);
    this.insertPivotTable();
  },

  didUpdateAttrs() {
    this._super(...arguments);
    debounce(this, this.insertPivotTable, 500, true);
  },

  insertPivotTable() {
    let { rows, options } = this.getProperties('rows', 'options');
    this.$('.pivot-table-container').pivotUI(rows, options);
  },

  refreshHandler(context) {
    return configuration => {
      let copy = JSON.parse(JSON.stringify(configuration));
      // Deletes functions and defaults: http://nicolas.kruchten.com/pivottable/examples/onrefresh.html
      delete copy.aggregators;
      delete copy.renderers;
      delete copy.rendererOptions;
      delete copy.localeStrings;
      context.sendAction('onRefresh', copy);
    };
  }
});

/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import $ from 'jquery';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

export default class PivotTableComponent extends Component {
  defaultOptions;

  constructor() {
    super(...arguments);
    this.defaultOptions = {
      unusedAttrsVertical: true,
      menuLimit: 200,
      renderers: $.extend($.pivotUtilities.renderers, $.pivotUtilities.c3_renderers, $.pivotUtilities.export_renderers)
    };
  }

  get options() {
    let deserialized = this.args.initialOptions;
    let options = this.defaultOptions;
    // Attach refresh handler
    return $.extend({ onRefresh: this.refreshHandler(this) }, deserialized, options);
  }

  refreshHandler(context) {
    return configuration => {
      let copy = JSON.parse(JSON.stringify(configuration));
      // Deletes functions and defaults: http://nicolas.kruchten.com/pivottable/examples/onrefresh.html
      delete copy.aggregators;
      delete copy.renderers;
      delete copy.rendererOptions;
      delete copy.localeStrings;
      context.args.onRefresh(copy);
    };
  }

  @action
  insertPivotTable(element) {
    $(element).pivotUI(this.args.rows, this.options);
  }

  @action
  onUpdate(element) {
    debounce(this, this.insertPivotTable, element, 500, true);
  }
}

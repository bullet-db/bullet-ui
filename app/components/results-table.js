/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import Component from '@ember/component';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';

export default Component.extend(PaginatedTable, {
  classNames: ['results-table'],
  results: null,
  pageSize: 5,

  extractors: EmberObject.create({
    created(row) {
      return row.get('created');
    },

    windows(row) {
      return row.get('windows.length');
    }
  }),

  rows: computed('results.[]', function() {
    return this.results.toArray();
  }),

  columns: A([
    { label: 'Date', valuePath: 'created', width: '150px', cellComponent: 'cells/result-date-entry' },
    { label: '# Windows', valuePath: 'windows', width: '80px', cellComponent: 'cells/result-number-entry' }
  ]),

  init() {
    this._super(...arguments);
    this.set('table', Table.create({ columns: this.columns }));
    this.addPages(1);
  }
});

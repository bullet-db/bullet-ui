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
  isFixed: true,

  extractors: EmberObject.create({
    created(row) {
      return row.get('created');
    },

    records(row) {
      return row.get('records.length');
    }
  }),

  rows: computed('results.[]', function() {
    return this.get('results').toArray();
  }),

  columns: A([
    { label: 'Date', valuePath: 'created', width: '150px', cellComponent: 'cells/result-date-entry' },
    { label: '# Records', valuePath: 'records', width: '80px', cellComponent: 'cells/result-number-entry' }
  ]),

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns')));
    this.addPages(1);
  }
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';

export default Ember.Component.extend(PaginatedTable, {
  classNames: ['results-table'],
  results: null,
  pageSize: 5,
  isFixed: true,

  extractors: Ember.Object.create({
    created(row) {
      return row.get('created');
    },

    records(row) {
      return row.get('records.length');
    }
  }),

  rows: Ember.computed('results.[]', function() {
    return this.get('results').toArray();
  }),

  columns: Ember.A([
    { label: 'Date', valuePath: 'created', width: '150px', cellComponent: 'cells/result-date-entry' },
    { label: '# Records', valuePath: 'records', width: '80px', cellComponent: 'cells/result-number-entry' }
  ]),

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns')));
    this.addPages(1);
  }
});

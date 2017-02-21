/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';

export default Ember.Component.extend(PaginatedTable, {
  classNames: ['records-table'],
  columnNames: null,
  cellComponent: 'cells/record-entry',
  pageSize: 10,
  isFixed: true,
  // Use natural types in the results
  useDefaultStringExtractor: false,

  rawRows: null,

  columns: Ember.computed('columnNames', function() {
    let names = this.get('columnNames');
    return names.map(item => Ember.Object.create({
      label: item,
      valuePath: item,
      resizable: true,
      draggable: true,
      cellComponent: this.get('cellComponent')
    }));
  }),

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns')));

    this.set('rows', this.get('rawRows').map(row => Ember.Object.create(row)));
    this.addPages(1);
  }
});

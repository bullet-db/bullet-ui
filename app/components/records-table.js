/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject, { computed } from '@ember/object';
import Component from '@ember/component';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';

export default Component.extend(PaginatedTable, {
  classNames: ['records-table'],
  columnNames: null,
  cellComponent: 'cells/record-entry',
  pageSize: 10,
  isFixed: true,
  // Use natural types in the results
  useDefaultStringExtractor: false,

  rawRows: null,

  columns: computed('columnNames', function() {
    let names = this.get('columnNames');
    return names.map(item => EmberObject.create({
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

    this.set('rows', this.get('rawRows').map(row => EmberObject.create(row)));
    this.addPages(1);
  }
});

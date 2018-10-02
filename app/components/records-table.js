/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject, { computed } from '@ember/object';
import Component from '@ember/component';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';
import { isNone } from '@ember/utils';

export default Component.extend(PaginatedTable, {
  classNames: ['records-table'],
  columnNames: null,
  cellComponent: 'cells/record-entry',
  pageSize: 10,
  appendMode: false,
  timeSeriesMode: false,

  sortedByColumn: null,
  alreadyReset: false,

  // Use natural types in the results
  useDefaultStringExtractor: false,
  rawRows: null,
  table: null,

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
    this.set('sortColumn', null);
    this.resetTable();
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('rows', this.get('rawRows').map(row => EmberObject.create(row)));
    let sortColumn = this.get('sortColumn');
    let hasSortedColumn = !isNone(sortColumn);
    let alreadyReset = this.get('alreadyReset');
    let timeSeriesMode = this.get('timeSeriesMode');

    // If we are switching to timeSeriesMode but have not reset yet or if we have reset but are switching off
    // timeSeriesMode (to remove the old extra columns), recreate the table
    if ((!alreadyReset && timeSeriesMode) || (alreadyReset && !timeSeriesMode)) {
      this.resetTable();
    }

    // Reset rows if we have a sorted column or we are switching to timeSeriesMode
    this.reset(hasSortedColumn || !alreadyReset);
    /*
      If timeSeriesMode is going from false to true, alreadyReset was false. So we will force a reset. Update
      alreadyReset to true now after it is used for resetting, so that on future calls of didReceiveAttrs with
      timeSeriesMode set to true, we don't reset and just append to the table. When timeSeriesMode goes to false after,
      alreadyReset will be true and we will set it to false after so that future calls will start this cycle again.
    */
    this.set('alreadyReset', timeSeriesMode);

    if (hasSortedColumn) {
      this.sortBy(sortColumn.valuePath, sortColumn.ascending ? 'ascending' : 'descending');
    }
    this.addPages();
  },

  resetTable() {
    this.set('table', new Table(this.get('columns')));
  }
});

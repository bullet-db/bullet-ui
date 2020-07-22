/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { tracked } from '@glimmer/tracking';
import EmberObject, { action } from '@ember/object';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/components/paginated-table';
import { isNone } from '@ember/utils';

const CELL_COMPONENT = 'cells/record-entry';

export default class RecordsTableComponent extends PaginatedTable {
  sortedByColumn;
  alreadyReset;
  @tracked table;
  rows;

  constructor() {
    super(...arguments);
    this.pageSize = 15;
    this.alreadyReset = false;
    // Use natural types in the results
    this.useDefaultStringExtractor = false;
    this.recreateTable();
    this.recomputeTable();
  }

  get columns() {
    let names = this.args.columnNames;
    return names.map(item => EmberObject.create({
      label: item,
      valuePath: item,
      resizable: true,
      draggable: true,
      cellComponent: CELL_COMPONENT
    }));
  }

  // Needs to be a getter to track the args appendMode so that the parent class can find the right value as it changes
  get appendMode() {
    return this.args.appendMode;
  }

  recreateTable() {
    this.table = Table.create({ columns: this.columns });
  }

  @action
  recomputeTable() {
    this.rows = [].concat(this.args.rows);
    let sortColumn = this.sortColumn;
    let hasSortedColumn = !isNone(sortColumn);
    let alreadyReset = this.alreadyReset;
    let timeSeriesMode = this.args.timeSeriesMode;

    // If we are switching to timeSeriesMode but have not reset yet or if we have reset but are switching off
    // timeSeriesMode (to remove the old extra columns), recreate the table
    if ((!alreadyReset && timeSeriesMode) || (alreadyReset && !timeSeriesMode)) {
      this.recreateTable();
    }

    // Reset rows if we have a sorted column or we are switching to timeSeriesMode
    this.reset(hasSortedColumn || !alreadyReset);
    /*
      If timeSeriesMode is going from false to true, alreadyReset was false. So we will force a reset. Update
      alreadyReset to true now after it is used for resetting, so that on future calls of this with
      timeSeriesMode set to true, we don't reset and just append to the table. When timeSeriesMode goes to false after,
      alreadyReset will be true and we will set it to false after so that future calls will start this cycle again.
    */
    this.alreadyReset = timeSeriesMode;

    if (hasSortedColumn) {
      this.sortBy(sortColumn.valuePath, sortColumn.ascending ? 'ascending' : 'descending');
    }
    this.addPages();
  }
}

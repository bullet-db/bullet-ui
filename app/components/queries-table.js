/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import EmberObject, { action } from '@ember/object';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/components/paginated-table';
import isEmpty from 'bullet-ui/utils/is-empty';

const QUERIES_TABLE_EXTRACTOR = EmberObject.create({
  name(row) {
    let name = row.get('name');
    if (!isEmpty(name)) {
      return name;
    }
    // Stick a ~~~ in front so that generated summaries sort together toward one end
    return `~~~${row.get('filterSummary')}${row.get('projectionsSummary')}${row.get('windowSummary')}`;
  },

  latestResult(row) {
    let latestResult = row.get('latestResult');
    return latestResult ? latestResult.get('created') : new Date(1);
  },

  results(row) {
    return row.get('results.length');
  }
});

export default class QueriesTableComponent extends PaginatedTable {
  extractors = QUERIES_TABLE_EXTRACTOR;
  columns = A([
    { label: 'Query', valuePath: 'name', cellComponent: 'cells/query-name-entry' },
    { label: 'Last Result', valuePath: 'latestResult', cellComponent: 'cells/query-date-entry', width: '20%' },
    { label: 'Historical Results', valuePath: 'results', cellComponent: 'cells/query-results-entry', width: '15%' }
  ]);

  constructor() {
    super(...arguments);
    this.pageSize = 10;
    this.table = Table.create({ columns: this.columns });
    this.sortBy('name', 'ascending');
    this.addPages(1);
  }

  get rows() {
    return this.args.queries.toArray();
  }

  insertNewRowAfter(currentRow) {
    let table = this.table;
    let index = table.get('rows').indexOf(currentRow);
    return row => {
      table.insertRowAt(index + 1, row);
    };
  }

  expandRowWithLink(row) {
    return link => {
      row.set('expanded', true);
      row.set('queryLink', link);
    };
  }

  @action
  queryClick(row) {
    this.args.queryClick(row.get('content'));
  }

  @action
  resultClick(result) {
    this.args.resultClick(result);
  }

  @action
  deleteResultsClick(row) {
    this.args.deleteResultsClick(row.get('content'));
  }

  @action
  copyQueryClick(row) {
    this.args.copyQueryClick(row.get('content'), this.insertNewRowAfter(row));
  }

  @action
  linkQueryClick(row) {
    if (row.get('expanded')) {
      row.set('expanded', false);
    } else {
      this.args.linkQueryClick(row.get('content'), this.expandRowWithLink(row));
    }
  }

  @action
  deleteQueryClick(row) {
    this.table.removeRow(row);
    this.args.deleteQueryClick(row.get('content'));
  }
}

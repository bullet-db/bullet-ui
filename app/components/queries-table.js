/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';

export default Ember.Component.extend(PaginatedTable, {
  classNames: ['queries-table'],
  queries: null,
  pageSize: 10,
  isFixed: true,
  extractors: Ember.Object.create({
    name(row) {
      let name = row.get('name');
      if (!Ember.isEmpty(name)) {
        return name;
      }
      // Stick a ~~~ in front so that generated summaries sort together toward one end
      return `~~~${row.get('filterSummary')}${row.get('projectionsSummary')}`;
    },

    latestResult(row) {
      let latestResult = row.get('latestResult');
      return latestResult ? latestResult.get('created') : new Date(1);
    },

    results(row) {
      return row.get('results.length');
    }
  }),

  rows: Ember.computed('queries.[]', function() {
    return this.get('queries').toArray();
  }),

  columns: Ember.A([
    { label: 'Query', valuePath: 'name', cellComponent: 'cells/query-name-entry' },
    { label: 'Last Result', valuePath: 'latestResult', cellComponent: 'cells/query-date-entry', width: '20%' },
    { label: 'Historical Results', valuePath: 'results', cellComponent: 'cells/query-results-entry', width: '15%' }
  ]),

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns')));
    this.sortBy('name', 'ascending');
    this.addPages(1);
  },

  resolveRow(currentRow) {
    let table = this.get('table');
    let index = table.get('rows').indexOf(currentRow);
    return (row) => {
      table.insertRowAt(index + 1, row);
    };
  },

  actions: {
    queryClick(row) {
      this.sendAction('queryClick', row.get('content'));
    },

    resultClick(result) {
      this.sendAction('resultClick', result);
    },

    deleteResultsClick(row) {
      this.sendAction('deleteResultsClick', row.get('content'));
    },

    copyQueryClick(row) {
      this.sendAction('copyQueryClick', row.get('content'), this.resolveRow(row));
    },

    deleteQueryClick(row) {
      this.get('table').removeRow(row);
      this.sendAction('deleteQueryClick', row.get('content'));
    }
  }
});

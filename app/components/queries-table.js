/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import Component from '@ember/component';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';

export default Component.extend(PaginatedTable, {
  classNames: ['queries-table'],
  queries: null,
  pageSize: 10,
  extractors: EmberObject.create({
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
  }),

  rows: computed('queries.[]', function() {
    return this.get('queries').toArray();
  }),

  columns: A([
    { label: 'Query', valuePath: 'name', cellComponent: 'cells/query-name-entry' },
    { label: 'Last Result', valuePath: 'latestResult', cellComponent: 'cells/query-date-entry', width: '20%' },
    { label: 'Historical Results', valuePath: 'results', cellComponent: 'cells/query-results-entry', width: '15%' }
  ]),

  init() {
    this._super(...arguments);
    this.set('table', Table.create({ columns: this.get('columns') }));
    this.sortBy('name', 'ascending');
    this.addPages(1);
  },

  insertNewRowAfter(currentRow) {
    let table = this.get('table');
    let index = table.get('rows').indexOf(currentRow);
    return row => {
      table.insertRowAt(index + 1, row);
    };
  },

  expandRowWithLink(row) {
    return link => {
      row.set('expanded', true);
      row.set('queryLink', link);
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
      this.sendAction('copyQueryClick', row.get('content'), this.insertNewRowAfter(row));
    },

    linkQueryClick(row) {
      if (row.get('expanded')) {
        row.set('expanded', false);
      } else {
        this.sendAction('linkQueryClick', row.get('content'), this.expandRowWithLink(row));
      }
    },

    deleteQueryClick(row) {
      this.get('table').removeRow(row);
      this.sendAction('deleteQueryClick', row.get('content'));
    }
  }
});

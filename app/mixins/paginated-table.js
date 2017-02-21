/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Mixin.create({
  rows: null,
  columns: null,
  pageSize: 15,
  firstNewRow: 0,
  extractors: null,
  useDefaultStringExtractor: true,

  numberOfRows: Ember.computed('rows.[]', function() {
    return this.get('rows.length');
  }),

  haveMoreRows: Ember.computed('firstNewRow', 'numberOfRows', function() {
    return this.get('firstNewRow') < this.get('numberOfRows');
  }),

  addRows(start, end) {
    end = Math.min(this.get('numberOfRows'), end);
    let toAdd = this.get('rows').slice(start, end);
    this.set('firstNewRow', end);
    this.get('table').addRows(toAdd);
  },

  addPages(pages = 1) {
    let { firstNewRow, pageSize } = this.getProperties('firstNewRow', 'pageSize');
    let lastNewRow = firstNewRow + (pageSize * pages);
    return this.addRows(firstNewRow, lastNewRow);
  },

  defaultExtractor(column) {
    return (row) => {
      let value = row.get(column);
      let valueType = Ember.typeOf(value);
      if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
        return value;
      }
      // If not a primitive, return a String version
      return String(value);
    };
  },

  getExtractor(column) {
    let extractor = this.get(`extractors.${column}`);
    if (extractor) {
      return extractor;
    }
    // Default String convertor
    if (this.get('useDefaultStringExtractor')) {
      return a => String(a.get(column));
    }
    // Identity
    return this.defaultExtractor(column);
  },

  sortBy(column, direction = 'ascending') {
    let rows = this.get('rows');
    rows.sort((a, b) => {
      let extractor = this.getExtractor(column);
      let itemA = extractor(a);
      let itemB = extractor(b);
      let comparison = 0;
      if (itemA < itemB) {
        comparison = -1;
      } else if (itemA > itemB) {
        comparison = 1;
      }
      return direction === 'ascending' ? comparison : -comparison;
    });
  },

  reset() {
    let table = this.get('table');
    table.setRows([]);
    this.set('firstNewRow', 0);
  },

  actions: {
    onColumnClick(column) {
      this.reset();
      this.sortBy(column.valuePath, column.ascending ? 'ascending' : 'descending');
      this.addPages();
    },

    onScrolledToBottom() {
      if (!this.get('isDestroyed') && !this.get('isDestroying') && this.get('haveMoreRows')) {
        this.addPages();
      }
    }
  }
});



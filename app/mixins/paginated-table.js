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

  getExtractor(key) {
    let extractor = this.get(`extractors.${key}`);
    if (extractor) {
      return extractor;
    }
    // Default String convertor
    return a => String(a.get(key));
  },

  sortBy(key, direction = 'ascending') {
    // TODO: Need to consider a partial sort for speed
    let rows = this.get('rows');
    rows.sort((a, b) => {
      let extractor = this.getExtractor(key);
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
    let { table, firstNewRow } = this.getProperties('table', 'firstNewRow');
    table.setRows([]);
    this.set('firstNewRow', 0);
  }
});



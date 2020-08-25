/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { typeOf } from '@ember/utils';
import { action, get } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PaginatedTable extends Component {
  @tracked pageSize = 15;
  @tracked firstNewRow = 0;
  @tracked sortColumn = null;
  useDefaultStringExtractor = true;
  appendMode = false;
  /* These should be defined by the child table components
  rows;
  table;
  // Optional if per column sorting customization is needed
  extractors;
  */

  get numberOfRows() {
    return this.rows.length;
  }

  get haveMoreRows() {
    return this.firstNewRow < this.numberOfRows;
  }

  addRows(start, end) {
    end = Math.min(this.numberOfRows, end);
    let toAdd = this.rows.slice(start, end);
    this.firstNewRow = end;
    this.table.addRows(toAdd);
  }

  addPages(pages = 1) {
    let { firstNewRow, pageSize } = this;
    let lastNewRow = firstNewRow + (pageSize * pages);
    return this.addRows(firstNewRow, lastNewRow);
  }

  defaultExtractor(column) {
    return row => {
      // Use regular instead of get in case column has '.' Only doing it here because the defaultExtractor is used
      // for unknown column names. When we define columns, we should not add columns with '.' in the name
      let value = row[column];
      let valueType = typeOf(value);
      if (valueType === 'string' || valueType === 'number' || valueType === 'boolean' || valueType === 'date') {
        return value;
      }
      // If not a primitive, return a String version
      return String(value);
    };
  }

  getExtractor(column) {
    let extractor = get(this, `extractors.${column}`);
    if (extractor) {
      return extractor;
    }
    // Default String convertor
    if (this.useDefaultStringExtractor) {
      return a => String(a[column]);
    }
    // Identity
    return this.defaultExtractor(column);
  }

  sortBy(column, direction = 'ascending') {
    let rows = this.rows;
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
  }

  reset(forceReset = false) {
    let table = this.table;
    // Reset table if not in appendMode
    if (!this.appendMode || forceReset) {
      table.setRows([]);
      this.firstNewRow = 0;
    }
  }

  @action
  onColumnClick(column) {
    this.sortColumn = column;
    this.reset(true);
    this.sortBy(column.valuePath, column.ascending ? 'ascending' : 'descending');
    this.addPages();
  }

  @action
  onScrolledToBottom() {
    if (!this.isDestroyed && !this.isDestroying && this.haveMoreRows) {
      this.addPages();
    }
  }
}

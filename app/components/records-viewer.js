/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { assign } from '@ember/polyfills';
import { typeOf } from '@ember/utils';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  fileSaver: service(),
  classNames: ['records-viewer'],
  showRawData: false,
  showTable: false,
  showChart: false,
  config: null,
  metadata: null,
  records: null,
  fileName: 'results',
  model: null,
  appendMode: false,
  timeSeriesMode: false,

  enableCharting: computed('config.isSingleRow', 'timeSeriesMode', function() {
    return !this.get('config.isSingleRow') || this.get('timeSeriesMode');
  }),

  isShowingChart: alias('showChart').readOnly(),

  columns: computed('records', function() {
    return A(this.extractUniqueColumns(this.get('records')));
  }).readOnly(),

  rows: computed('records', 'columns', function() {
    return A(this.extractRows(this.get('records'), this.get('columns')));
  }).readOnly(),

  asJSON: computed('records', function() {
    let records = this.get('records');
    return JSON.stringify(records, null, 2);
  }).readOnly(),

  asCSV: computed('columns', 'rows', function() {
    return this.makeCSVString(this.get('columns'), this.get('rows'));
  }).readOnly(),

  asFlatCSV: computed('records', function() {
    let records = this.get('records');
    let flattenedRows = records.map(item => this.flatten(item), this);
    let columns = this.extractUniqueColumns(flattenedRows);
    let rows = this.extractRows(flattenedRows, columns);
    return this.makeCSVString(columns, rows);
  }).readOnly(),

  init() {
    this._super(...arguments);
    if (this.get('config.isReallyRaw')) {
      this.set('showRawData', true);
    } else {
      this.set('showTable', true);
    }
  },

  didReceiveAttrs() {
    this._super(...arguments);
    // If we should suddenly stop showing charts but we were showing a chart, go back to table
    if (this.get('isShowingChart') && !this.get('enableCharting')) {
      this.flipTo('showTable');
    }
  },

  extractUniqueColumns(records) {
    let columns = new Set();
    records.forEach(record => {
      for (let item in record) {
        if (!columns.has(item)) {
          columns.add(item);
        }
      }
    });
    let columnArray = Array.from(columns);
    columnArray.sort();
    return columnArray;
  },

  extractRows(records, columns) {
    let rows = [];
    records.forEach(record => {
      let row = [];
      columns.forEach(column => {
        row.push(this.cleanItem(record[column]));
      });
      rows.push(row);
    });
    return rows;
  },

  makeCSVString(columns, rows) {
    let header = columns.join(',');
    let body = rows.map(row => row.join(','));
    return header + '\r\n' + body.join('\r\n');
  },

  cleanItem(item) {
    let type = typeOf(item);
    if (type === 'object' || type === 'array') {
      return JSON.stringify(item);
    }
    return item;
  },

  /* Takes a JSON object and recursively flattens arrays and objects in it to from a single JSON object with just primitives.
   * @param  {Object} json   The JSON object.
   * @param  {String} prefix Internal use only.
   * @return {String}        The flattened JSON object.
   */
  flatten(json, prefix) {
    let flattened = {};
    let type = typeOf(json);
    if (type !== 'array' && type !== 'object') {
      flattened[prefix] = json;
      return flattened;
    }
    // It's a complex type, recursively flatten with the current prefix
    prefix = prefix === undefined ? '' : `${prefix}:`;
    for (let item in json) {
      let nested = this.flatten(json[item], `${prefix}${item}`);
      assign(flattened, nested);
    }
    return flattened;
  },

  flipTo(field) {
    this.set('showRawData', false);
    this.set('showTable', false);
    this.set('showChart', false);
    this.set(field, true);
  },

  actions: {
    rawDataMode() {
      this.flipTo('showRawData');
    },

    tableMode() {
      this.flipTo('showTable');
    },

    chartMode() {
      this.flipTo('showChart');
    },

    downloadAsJSON() {
      this.get('fileSaver').save(this.get('asJSON'), 'application/json', `${this.get('fileName')}.json`);
    },

    downloadAsCSV() {
      this.get('fileSaver').save(this.get('asCSV'), 'text/csv', `${this.get('fileName')}.csv`);
    },

    downloadAsFlatCSV() {
      this.get('fileSaver').save(this.get('asFlatCSV'), 'text/csv', `${this.get('fileName')}_flat.csv`);
    }
  }
});

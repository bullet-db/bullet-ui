/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  fileSaver: Ember.inject.service(),
  classNames: ['records-viewer'],
  showTable: false,
  records: null,
  fileName: 'results',

  columns: Ember.computed('records', function() {
    return Ember.A(this.extractUniqueColumns(this.get('records')));
  }).readOnly(),

  rows: Ember.computed('records', 'columns', function() {
    return Ember.A(this.extractRows(this.get('records'), this.get('columns')));
  }).readOnly(),

  asJSON: Ember.computed('records', function() {
    let records = this.get('records');
    return JSON.stringify(records, null, 2);
  }).readOnly(),

  asCSV: Ember.computed('columns', 'rows', function() {
    return this.makeCSVString(this.get('columns'), this.get('rows'));
  }).readOnly(),

  asFlatCSV: Ember.computed('records', function() {
    let records = this.get('records');
    let flattenedRows = records.map((item) => this.flatten(item), this);
    let columns = this.extractUniqueColumns(flattenedRows);
    let rows = this.extractRows(flattenedRows, columns);
    return this.makeCSVString(columns, rows);
  }).readOnly(),

  extractUniqueColumns(records) {
    let columns = new Set();
    records.forEach((record) => {
      for (let item in record) {
        if (!columns.has(item)) {
          columns.add(item);
        }
      }
    });
    let columnArray =  Array.from(columns);
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
    let type = Ember.typeOf(item);
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
    let type = Ember.typeOf(json);
    if (type !== 'array' && type !== 'object') {
      flattened[prefix] = json;
      return flattened;
    }
    // It's a complex type, recursively flatten with the current prefix
    prefix = prefix === undefined ? '' : `${prefix}:`;
    for (let item in json) {
      let nested = this.flatten(json[item], `${prefix}${item}`);
      Ember.merge(flattened, nested);
    }
    return flattened;
  },

  actions: {
    showRawData() {
      this.set('showTable', false);
    },

    showTable() {
      this.set('showTable', true);
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

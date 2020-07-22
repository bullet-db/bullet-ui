/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assign } from '@ember/polyfills';
import { typeOf } from '@ember/utils';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { alias, not, or } from '@ember/object/computed';
import { inject as service } from '@ember/service';

const FILE_NAME = 'results';
export default class RecordsViewerComponent extends Component {
  @service fileSaver;
  @tracked showRawData = false;
  @tracked showTable = false;
  @tracked showChart = false;

  @alias('args.config.isSingleRow') isSingleRow;
  @not('isSingleRow') isNotSingleRow;
  @or('isNotSingleRow', 'args.timeSeriesMode') enableCharting;
  @alias('showChart') isShowingChart;

  constructor() {
    super(...arguments);
    if (this.args.config.isReallyRaw) {
      this.showRawData = true;
    } else {
      this.showTable = true;
    }
  }

  get columns() {
    return A(RecordsViewerComponent.extractUniqueColumns(this.args.records));
  }

  get rows() {
    return A(this.extractRows(this.args.records, this.columns));
  }

  get asJSON() {
    return JSON.stringify(this.args.records, null, 2);
  }

  get asCSV() {
    return RecordsViewerComponent.makeCSVString(this.columns, this.rows);
  }

  get asFlatCSV() {
    let records = this.args.records;
    let flattenedRows = records.map(item => this.flatten(item), this);
    let columns = RecordsViewerComponent.extractUniqueColumns(flattenedRows);
    let rows = RecordsViewerComponent.extractRows(flattenedRows, columns);
    return RecordsViewerComponent.makeCSVString(columns, rows);
  }

  static extractUniqueColumns(records) {
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
  }

  static extractRows(records, columns) {
    let rows = [];
    records.forEach(record => {
      let row = [];
      columns.forEach(column => {
        row.push(RecordsViewerComponent.cleanItem(record[column]));
      });
      rows.push(row);
    });
    return rows;
  }

  static makeCSVString(columns, rows) {
    let header = columns.join(',');
    let body = rows.map(row => row.join(','));
    return header + '\r\n' + body.join('\r\n');
  }

  static cleanItem(item) {
    let type = typeOf(item);
    if (type === 'object' || type === 'array') {
      return JSON.stringify(item);
    }
    return item;
  }

  /* Takes a JSON object and recursively flattens arrays and objects in it to from a single JSON object with just primitives.
   * @param  {Object} json   The JSON object.
   * @param  {String} prefix Internal use only.
   * @return {String}        The flattened JSON object.
   */
  static flatten(json, prefix) {
    let flattened = {};
    let type = typeOf(json);
    if (type !== 'array' && type !== 'object') {
      flattened[prefix] = json;
      return flattened;
    }
    // It's a complex type, recursively flatten with the current prefix
    prefix = prefix === undefined ? '' : `${prefix}:`;
    for (let item in json) {
      let nested = RecordsViewerComponent.flatten(json[item], `${prefix}${item}`);
      assign(flattened, nested);
    }
    return flattened;
  }

  flipTo(field) {
    this.showRawData = false;
    this.showTable = false;
    this.showChart = false;
    this[field] = true;
  }

  @action
  reset() {
    // If we should suddenly stop showing charts but we were showing a chart, go back to table
    if (this.isShowingChart && !this.enableCharting) {
      this.flipTo('showTable');
    }
  }

  @action
  rawDataMode() {
    this.flipTo('showRawData');
  }

  @action
  tableMode() {
    this.flipTo('showTable');
  }

  @action
  chartMode() {
    this.flipTo('showChart');
  }

  @action
  downloadAsJSON() {
    this.fileSaver.save(this.asJSON, 'application/json', `${FILE_NAME}.json`);
  }

  @action
  downloadAsCSV() {
    this.fileSaver.save(this.asCSV, 'text/csv', `${FILE_NAME}.csv`);
  }

  @action
  downloadAsFlatCSV() {
    this.fileSaver.save(this.asFlatCSV, 'text/csv', `${FILE_NAME}_flat.csv`);
  }
}

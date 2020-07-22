/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { isEmpty, isEqual, typeOf } from '@ember/utils';
import { action } from '@ember/object';
import { not, alias, or } from '@ember/object/computed';
import { WINDOW_CREATED_KEY, WINDOW_NUMBER_KEY } from 'bullet-ui/utils/window-cache';
import argsGet from 'bullet-ui/utils/args-get';

const TIME_SERIES_INDEPENDENT_COLUMN = WINDOW_CREATED_KEY;
const TIME_SERIES_WINDOW_COLUMN = WINDOW_NUMBER_KEY;
const TIME_SERIES_OPTIONS = {
  scales: { xAxes: [{ type: 'time' }] },
  animation: { duration: 0 },
  hover: { animationDuration: 0 },
  responsiveAnimationDuration: 0,
  elements: {
    line: { tension: 0 }
  }
};
export default class RecordsCharterComponent extends Component {
  @tracked showLineChart = true;
  @tracked showBarChart = false;
  @tracked showPieChart = false;
  @tracked showPivotMode = false;

  @alias('args.config.isDistribution') isDistribution;
  @not('args.timeSeriesMode') regularMode;
  @not('timeSeriesMode') canShowPieChart;
  @alias('showPieChart') needsColorArray;
  @alias('config.isRaw') canOnlyPivot;
  @or('showPivotMode', 'canOnlyPivot') pivotMode;

  get sampleRow() {
    let typicalRow = { };
    let rows = this.args.rows;
    this.args.columns.forEach(column => {
      for (let row of rows) {
        let value = row[column];
        if (!isEmpty(value)) {
          typicalRow[column] = value;
          break;
        }
      }
    });
    return typicalRow;
  }

  get pivotOptions() {
    let options = argsGet(this.args, 'config', {});
    return JSON.parse(options.pivotOptions || '{}');
  }

  //////////////////////////////////////////////// Regular Chart Items  //////////////////////////////////////////////

  get regularIndependentColumns() {
    let columns = this.args.columns;
    if (this.isDistribution) {
      return A(columns.filter(c => this.isAny(c, 'Quantile', 'Range')));
    }
    // Pick all string columns
    let sampleRow = this.sampleRow;
    return A(columns.filter(c => this.isType(sampleRow, c, 'string')));
  }

  get regularDependentColumns() {
    let columns = this.args.columns;
    if (this.isDistribution) {
      return A(columns.filter(c => this.isAny(c, 'Count', 'Value', 'Probability')));
    }
    // Pick all number columns
    let sampleRow = this.sampleRow;
    return A(columns.filter(c => this.isType(sampleRow, c, 'number')));
  }

  get regularLabels() {
    // Only one independent column for now
    let rows = this.args.rows;
    let columns = this.regularIndependentColumns;
    // [ [column1 values...], [column2 values...], ...]
    let valuesList = columns.map(column => this.getColumnValues(column, rows));
    // valuesList won't be empty because all non-Raw aggregations will have at least one string field
    return this.zip(valuesList);
  }

  get regularColors() {
    return this.needsColorArray ? this.fixedColors(this.regularLabels) : undefined;
  }

  get regularDatasets() {
    let rows = this.args.rows;
    let colors = this.regularColors;
    return this.regularDependentColumns.map((column, i) => this.columnarDataset(column, rows, colors, i));
  }

  get regularOptions() {
    if (this.regularDependentColumns.length > 1) {
      return {
        scales: { yAxes: [{ position: 'left', id: '0' }, { position: 'right', id: '1' }] }
      };
    }
  }

  get regularData() {
    return { labels: this.regularLabels, datasets: this.regularDatasets };
  }

  /////////////////////////////////////////////// TimeSeries Chart Items  //////////////////////////////////////////////

  get timeSeriesOptions() {
    return TIME_SERIES_OPTIONS;
  }

  get timeSeriesMetric() {
    let columns = this.args.columns;
    let fieldIndex;
    if (this.isDistribution) {
      fieldIndex = columns.findIndex(c => isEqual(c, 'Count') || isEqual(c, 'Value'));
    } else {
      // Find the first numeric field
      fieldIndex = columns.findIndex(c => this.isType(this.sampleRow, c, 'number'));
    }
    return columns.get(fieldIndex);
  }

  get timeSeriesDependentColumns() {
    let columns = this.args.columns;
    let sampleRow = this.sampleRow;
    let independentColumn = TIME_SERIES_INDEPENDENT_COLUMN;
    let windowColumn = TIME_SERIES_WINDOW_COLUMN;
    let metricColumn = this.timeSeriesMetric;
    if (this.isDistribution) {
      return A(columns.filter(c => this.isAny(c, 'Quantile', 'Range')));
    }
    // For other time series data, all other string columns besides the metric and the injected window keys make up
    // unique time lines. If there are no such columns, this is empty.
    return A(columns.filter(c => !this.isAny(c, independentColumn, windowColumn, metricColumn) && this.isType(sampleRow, c, 'string')));
  }

  get timeSeriesLabels() {
    let labelColumn = TIME_SERIES_INDEPENDENT_COLUMN;
    let windowColumn = TIME_SERIES_WINDOW_COLUMN;
    // Map preserves insertion order
    let labels = [];
    let windows = new Map();
    this.args.rows.forEach(row => windows.set(row[windowColumn], row[labelColumn]));
    windows.forEach(v => labels.push(v));
    return labels;
  }

  get timeSeriesDatasets() {
    let metricColumn = this.timeSeriesMetric;
    let windowColumn = TIME_SERIES_WINDOW_COLUMN;
    let columns = this.timeSeriesDependentColumns;
    let rows = this.args.rows;
    // If no columns, then the metricColumn is the only dataset.
    if (isEmpty(columns)) {
      return [this.timeSeriesDataset(metricColumn, rows.map(row => row[metricColumn]))];
    }
    let windows = this.groupTimeSeriesData(rows, columns, windowColumn, metricColumn);
    let datasets = { };
    // If a dataset (a unique set of values for the columns) does not have a timeseries already. Generate one by
    // scanning all rows. This is n*w (rows * windows). However, if all or most windows contain the dataset in its
    // rows, it should be ~n instead.
    // One value per window in windows - a Map of Maps. Add null if the values map per window does not have one for
    // dataset. Values per dataset look like: [ 13, null, -2, null, ...], where its length === number of windows
    rows.forEach(row => {
      // Generate a name using all the row values in column order. Nothing to do if this dataset has already been populated
      let dataset = this.getJoinedRowValues(columns, row);
      if (!isEmpty(datasets[dataset])) {
        return;
      }
      let values = [];
      windows.forEach(valueMap => values.push(valueMap.has(dataset) ? valueMap.get(dataset) : null));
      datasets[dataset] = this.timeSeriesDataset(dataset, values);
    });
    return Object.keys(datasets).map(dataset => datasets[dataset]);
  }

  get timeSeriesData() {
    return { labels: this.timeSeriesLabels, datasets: this.timeSeriesDatasets };
  }

  ////////////////////////////////////////////////// Static Helpers ////////////////////////////////////////////////

  // This goes over the rows and builds a Map of Maps where each first level contains all the unique groupKeys
  // and each second level contains all the unique dataset names and its one metric value (per group)
  static groupTimeSeriesData(rows, columns, groupKey, metricKey) {
    let grouped = new Map();
    // Since rows are sorted by groupKey, we will insert in groupKey order
    rows.forEach(row => {
      let groupName = row[groupKey];
      let dataset = this.getJoinedRowValues(columns, row);
      let metricValue = row[metricKey];
      let group = grouped.get(groupName);
      // No definition for nested Map, create and insert now to keep insertion order
      if (isEmpty(group)) {
        group = new Map();
        grouped.set(groupName, group);
      }
      // Don't care about insertion order in nested Map
      group.set(dataset, metricValue);
    });
    return grouped;
  }

  static timeSeriesDataset(datasetName, values) {
    // Picks the same color deterministically for a datasetName
    let color = this.fixedColor(datasetName);
    return {
      label: datasetName,
      data: values,
      backgroundColor: color,
      borderColor: color,
      fill: false
    };
  }

  static columnarDataset(column, rows, color, index) {
    let values = this.getColumnValues(column, rows);
    let colorValue = color ? color : this.randomColor();
    let dataset = {
      label: column,
      data: values,
      backgroundColor: colorValue,
      borderColor: colorValue,
      fill: false
    };
    // Add yAxisID only if we have more than one dataset. More than 2 => Add the first y-axis
    if (index === 1) {
      dataset.yAxisID = '1';
    } else if (index > 1) {
      dataset.yAxisID = '0';
    }
    return dataset;
  }

  zip(arrayOfArrays, delimiter = '/') {
    let zipped = arrayOfArrays[0].map((_, i) => arrayOfArrays.map(a => a[i]));
    return zipped.map(a => this.join(a, delimiter));
  }

  static join(array, delimiter) {
    return array.reduce((p, c) => `${p}${delimiter}${c}`);
  }

  static getColumnValues(column, rows) {
    return rows.map(row => row[column]);
  }

  static getJoinedRowValues(columns, row, delimiter = '/') {
    return this.join(columns.map(column => row[column]), delimiter);
  }

  static fixedColors(names) {
    let colors = [];
    for (let i = 0; i < names.length; ++i) {
      colors.push(this.fixedColor(names[i]));
    }
    return colors;
  }

  static fixedColor(atom) {
    // Multiply by a large prime if number. Then stick the result into a string regardless.
    let string = `${isEqual(typeOf(atom), 'number') ? atom * 104729 : atom}`;
    let hash = this.hash(string);
    let colors = [];
    for (let i = 0; i <= 2; ++i, hash = hash >> 8) {
      colors.push(hash & 0xFF);
    }
    return `rgb(${colors[0]},${colors[1]},${colors[2]})`;
  }

  static randomColor() {
    let red = this.randomUpto(255);
    let green = this.randomUpto(255);
    let blue = this.randomUpto(255);
    return `rgb(${red},${green},${blue})`;
  }

  static randomUpto(size) {
    return Math.floor(Math.random() * size);
  }

  static isType(row, field, type) {
    return isEqual(typeOf(row[field]), type);
  }

  static isAny(field, ...values) {
    for (let value of values) {
      if (isEqual(field, value)) {
        return true;
      }
    }
    return false;
  }

  // A modified version of https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  static hash(s) {
    let hash = 0;
    for (let i = 0; i < s.length; ++i) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
    }
    return hash;
  }

  turnOffAllCharts() {
    this.showBarChart = false;
    this.showLineChart = false;
    this.showPieChart = false;
  }

  changeChart(fieldToSet) {
    this.turnOffAllCharts();
    this[fieldToSet] = true;
  }

  @action
  reset() {
    if (this.args.timeSeriesMode && this.showPieChart) {
      this.changeChart('showLineChart');
    }
  }

  @action
  saveOptions(options) {
    let model = this.args.model;
    model.set('pivotOptions', JSON.stringify(options));
    model.save();
  }

  @action
  togglePivot() {
    this.turnOffAllCharts();
    this.showPivotMode = !this.showPivotMode;
  }

  @action
  changeChart(field) {
    this.showPivotMode = false;
    this.changeChart(field);
  }
}

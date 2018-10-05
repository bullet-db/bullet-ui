/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { WINDOW_CREATED_KEY, WINDOW_NUMBER_KEY } from 'bullet-ui/components/result-viewer';

import { A } from '@ember/array';
import { isEmpty, isEqual, typeOf } from '@ember/utils';
import { computed } from '@ember/object';
import { not, alias, or } from '@ember/object/computed';
import Component from '@ember/component';

const TIME_SERIES_OPTIONS = {
  scales: { xAxes: [{ type: 'time' }] },
  animation: { duration: 0 },
  hover: { animationDuration: 0 },
  responsiveAnimationDuration: 0,
  elements: {
    line: { tension: 0 }
  }
};

export default Component.extend({
  classNames: ['records-charter'],
  model: null,
  columns: null,
  rows: null,
  config: null,
  // Can't use to pass to ember-chart the type because it only uses the type on creation

  showLineChart: true,
  showBarChart: false,
  showPieChart: false,
  showPivotMode: false,

  timeSeriesMode: false,
  regularMode: not('timeSeriesMode').readOnly(),
  canShowPieChart: not('timeSeriesMode').readOnly(),
  needsColorArray: alias('showPieChart').readOnly(),
  canOnlyPivot: alias('config.isRaw').readOnly(),
  pivotMode: or('showPivotMode', 'canOnlyPivot').readOnly(),
  pivotOptions: computed('config.pivotOptions', function() {
    return JSON.parse(this.get('config.pivotOptions') || '{}');
  }).readOnly(),

  didReceiveAttrs() {
    this._super(...arguments);
    // If we were in pie chart mode and switched to time series, reset to line
    if (this.get('timeSeriesMode') && this.get('showPieChart')) {
      this.changeChart('showLineChart');
    }
  },

  sampleRow: computed('rows', 'columns', function() {
    let typicalRow = { };
    let rows = this.get('rows');
    this.get('columns').forEach(column => {
      for (let row of rows) {
        let value = row[column];
        if (!isEmpty(value)) {
          typicalRow[column] = value;
          break;
        }
      }
    });
    return typicalRow;
  }).readOnly(),

  //////////////////////////////////////////////// Regular Chart Items  //////////////////////////////////////////////

  regularIndependentColumns: computed('config', 'sampleRow', 'columns', function() {
    let columns = this.get('columns');
    if (this.get('config.isDistribution')) {
      return A(columns.filter(c => this.isAny(c, 'Quantile', 'Range')));
    }
    // Pick all string columns
    let sampleRow = this.get('sampleRow');
    return A(columns.filter(c => this.isType(sampleRow, c, 'string')));
  }).readOnly(),

  regularDependentColumns: computed('config', 'sampleRow', 'columns', function() {
    let columns = this.get('columns');
    if (this.get('config.isDistribution')) {
      return A(columns.filter(c => this.isAny(c, 'Count', 'Value', 'Probability')));
    }
    // Pick all number columns
    let sampleRow = this.get('sampleRow');
    return A(columns.filter(c => this.isType(sampleRow, c, 'number')));
  }).readOnly(),

  regularLabels: computed('regularIndependentColumns', 'rows', function() {
    // Only one independent column for now
    let rows = this.get('rows');
    let columns = this.get('regularIndependentColumns');
    // [ [column1 values...], [column2 values...], ...]
    let valuesList = columns.map(column => this.getColumnValues(column, rows));
    // valuesList won't be empty because all non-Raw aggregations will have at least one string field
    return this.zip(valuesList);
  }).readOnly(),

  regularColors: computed('needsColorArray', 'regularLabels', function() {
    return this.get('needsColorArray') ? this.fixedColors(this.get('regularLabels')) : undefined;
  }).readOnly(),

  regularDatasets: computed('regularLabels', 'regularDependentColumns', 'regularColors', 'rows', function() {
    let rows = this.get('rows');
    let colors = this.get('regularColors');
    return this.get('regularDependentColumns').map((column, i) => this.columnarDataset(column, rows, colors, i));
  }).readOnly(),

  regularOptions: computed('regularDependentColumns', function() {
    if (this.get('regularDependentColumns.length') > 1) {
      return {
        scales: { yAxes: [{ position: 'left', id: '0' }, { position: 'right', id: '1' }] }
      };
    }
  }).readOnly(),

  regularData: computed('regularLabels', 'regularDatasets', function() {
    return { labels: this.get('regularLabels'), datasets: this.get('regularDatasets') };
  }).readOnly(),

  /////////////////////////////////////////////// TimeSeries Chart Items  //////////////////////////////////////////////

  timeSeriesIndependentColumn: WINDOW_CREATED_KEY,
  timeSeriesWindowColumn: WINDOW_NUMBER_KEY,
  timeSeriesOptions: TIME_SERIES_OPTIONS,

  timeSeriesMetric: computed('config', 'sampleRow', 'columns', function() {
    let { sampleRow, columns } = this.getProperties('sampleRow', 'columns');
    let fieldIndex;
    if (this.get('config.isDistribution')) {
      fieldIndex = columns.findIndex(c => isEqual(c, 'Count') || isEqual(c, 'Value'));
    } else {
      // Find the first numeric field
      fieldIndex = columns.findIndex(c => this.isType(sampleRow, c, 'number'));
    }
    return columns.get(fieldIndex);
  }).readOnly(),

  timeSeriesDependentColumns: computed('config', 'columns', 'sampleRow', 'timeSeriesIndependentColumn', 'timeSeriesWindowColumn', 'timeSeriesMetric', function() {
    let columns = this.get('columns');
    let sampleRow = this.get('sampleRow');
    let independentColumn = this.get('timeSeriesIndependentColumn');
    let windowColumn = this.get('timeSeriesWindowColumn');
    let metricColumn = this.get('timeSeriesMetric');
    if (this.get('config.isDistribution')) {
      return A(columns.filter(c => this.isAny(c, 'Quantile', 'Range')));
    }
    // For other time series data, all other string columns besides the metric and the injected window keys make up
    // unique time lines. If there are no such columns, this is empty.
    return A(columns.filter(c => !this.isAny(c, independentColumn, windowColumn, metricColumn) && this.isType(sampleRow, c, 'string')));
  }),

  timeSeriesLabels: computed('timeSeriesIndependentColumn', 'timeSeriesWindowColumn', 'rows', function() {
    let labelColumn = this.get('timeSeriesIndependentColumn');
    let windowColumn = this.get('timeSeriesWindowColumn');
    // Map preserves insertion order
    let labels = [];
    let windows = new Map();
    this.get('rows').forEach(row => windows.set(row[windowColumn], row[labelColumn]));
    windows.forEach(v => labels.push(v));
    return labels;
  }).readOnly(),

  timeSeriesDatasets: computed('timeSeriesMetric', 'timeSeriesWindowColumn', 'timeSeriesDependentColumns', 'rows', function() {
    let metricColumn = this.get('timeSeriesMetric');
    let columns = this.get('timeSeriesDependentColumns');
    let rows = this.get('rows');
    // If no columns, then the metricColumn is the only dataset.
    if (isEmpty(columns)) {
      return [this.timeSeriesDataset(metricColumn, rows.map(row => row[metricColumn]))];
    }
    let windows = this.groupTimeSeriesData(rows, columns, this.get('timeSeriesWindowColumn'), metricColumn);
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
  }).readOnly(),

  timeSeriesData: computed('timeSeriesLabels', 'timeSeriesDatasets', function() {
    return { labels: this.get('timeSeriesLabels'), datasets: this.get('timeSeriesDatasets') };
  }).readOnly(),

  //////////////////////////////////////////////////// Helpers //////////////////////////////////////////////////

  // This goes over the rows and builds a Map of Maps where each first level contains all the unique groupKeys
  // and each second level contains all the unique dataset names and its one metric value (per group)
  groupTimeSeriesData(rows, columns, groupKey, metricKey) {
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
  },

  timeSeriesDataset(datasetName, values) {
    // Picks the same color deterministically for a datasetName
    let color = this.fixedColor(datasetName);
    return {
      label: datasetName,
      data: values,
      backgroundColor: color,
      borderColor: color,
      fill: false
    };
  },

  columnarDataset(column, rows, color, index) {
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
  },

  zip(arrayOfArrays, delimiter = '/') {
    let zipped = arrayOfArrays[0].map((_, i) => arrayOfArrays.map(a => a[i]));
    return zipped.map(a => this.join(a, delimiter));
  },

  join(array, delimiter) {
    return array.reduce((p, c) => `${p}${delimiter}${c}`);
  },

  getColumnValues(column, rows) {
    return rows.map(row => row[column]);
  },

  getJoinedRowValues(columns, row, delimiter = '/') {
    return this.join(columns.map(column => row[column]), delimiter);
  },

  fixedColors(names) {
    let colors = [];
    for (let i = 0; i < names.length; ++i) {
      colors.push(this.fixedColor(names[i]));
    }
    return colors;
  },

  fixedColor(atom) {
    // Multiply by a large prime if number. Then stick the result into a string regardless.
    let string = `${isEqual(typeOf(atom), 'number') ? atom * 104729 : atom}`;
    let hash = this.hash(string);
    let colors = [];
    for (let i = 0; i <= 2; ++i, hash = hash >> 8) {
      colors.push(hash & 0xFF);
    }
    return `rgb(${colors[0]},${colors[1]},${colors[2]})`;
  },

  randomColor() {
    let red = this.randomUpto(255);
    let green = this.randomUpto(255);
    let blue = this.randomUpto(255);
    return `rgb(${red},${green},${blue})`;
  },

  randomUpto(size) {
    return Math.floor(Math.random() * size);
  },

  isType(row, field, type) {
    return isEqual(typeOf(row[field]), type);
  },

  isAny(field, ...values) {
    for (let value of values) {
      if (isEqual(field, value)) {
        return true;
      }
    }
    return false;
  },

  // A modified version of https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  hash(s) {
    let hash = 0;
    for (let i = 0; i < s.length; ++i) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
    }
    return hash;
  },

  turnOffAllCharts() {
    this.set('showBarChart', false);
    this.set('showLineChart', false);
    this.set('showPieChart', false);
  },

  changeChart(fieldToSet) {
    this.turnOffAllCharts();
    this.set(fieldToSet, true);
  },

  actions: {
    saveOptions(options) {
      let model = this.get('model');
      model.set('pivotOptions', JSON.stringify(options));
      model.save();
    },

    togglePivot() {
      this.turnOffAllCharts();
      this.toggleProperty('showPivotMode');
    },

    changeChart(field) {
      this.set('showPivotMode', false);
      this.changeChart(field);
    }
  }
});

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
import { inject as service } from '@ember/service';

export default Component.extend({
  moment: Ember.inject.service(),
  classNames: ['records-charter'],
  model: null,
  columns: null,
  rows: null,
  chartType: 'bar',
  config: null,

  timeSeriesMode: false,
  regularMode: not('timeSeriesMode').readOnly(),
  notSimpleMode: false,
  simpleMode: not('notSimpleMode').readOnly(),
  cannotModeSwitch: alias('config.isRaw').readOnly(),
  canModeSwitch: not('cannotModeSwitch').readOnly(),
  pivotMode: or('notSimpleMode', 'cannotModeSwitch').readOnly(),
  pivotOptions: computed('config.pivotOptions', function() {
    return JSON.parse(this.get('config.pivotOptions') || '{}');
  }).readOnly(),

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

  regularOptions: computed('regularDependentColumns', function() {
    if (this.get('regularDependentColumns.length') > 1) {
      return {
        scales: { yAxes: [{ position: 'left', id: '0' }, { position: 'right', id: '1' }] }
      };
    }
  }).readOnly(),

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

  regularDatasets: computed('regularDependentColumns', 'rows', function() {
    let rows = this.get('rows');
    return this.get('regularDependentColumns').map((column, i) => this.columnarDataset(column, rows, i));
  }).readOnly(),

  regularData: computed('regularLabels', 'regularDatasets', function() {
    return { labels: this.get('regularLabels'), datasets: this.get('regularDatasets') };
  }).readOnly(),

  /////////////////////////////////////////////// TimeSeries Chart Items  //////////////////////////////////////////////

  timeSeriesIndependentColumn: WINDOW_CREATED_KEY,
  timeSeriesWindowColumn: WINDOW_NUMBER_KEY,

  timeSeriesOptions: {
    scales: { xAxes: [{ type: 'time' }] },
    animation: { duration: 0 },
    hover: { animationDuration: 0 },
    responsiveAnimationDuration: 0,
    elements: {
      line: { tension: 0 }
    }
  },

  timeSeriesMetric: computed('sampleRow', 'columns', function() {
    let { sampleRow, columns } = this.getProperties('sampleRow', 'columns');
    // Find the first numeric field
    let fieldIndex = columns.findIndex(c => this.isType(sampleRow, c, 'number'));
    return columns.get(fieldIndex);
  }).readOnly(),

  timeSeriesDependentColumns: computed('columns', 'timeSeriesIndependentColumn', 'timeSeriesWindowColumn', 'timeSeriesMetric', function() {
    let columns = this.get('columns');
    let independentColumn = this.get('timeSeriesIndependentColumn');
    let windowColumn = this.get('timeSeriesWindowColumn');
    let metricColumn = this.get('timeSeriesMetric');
    // For time series data, all other columns besides the metric and the injected window keys make up
    // unique time lines. If there are no such columns, this is empty.
    return A(columns.filter(c => !this.isAny(c, independentColumn, windowColumn, metricColumn)));
  }),

  timeSeriesLabels: computed('timeSeriesIndependentColumn', 'timeSeriesWindowColumn', 'rows', function() {
    let labelColumn = this.get('timeSeriesIndependentColumn');
    let windowColumn = this.get('timeSeriesWindowColumn');
    // Map preserves insertion order
    let labels = [];
    let windows = new Map();
    let timeLabels = this.get('rows').forEach(row => windows.set(row[windowColumn], row[labelColumn]));
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
    let datasets =  { };
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
      let values = []
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
  // and each second level contains all the unique dataset names and its one metric value (per group).
  groupTimeSeriesData(rows, columns, groupKey, metricKey) {
    let grouped = new Map();
    // Since rows are sorted by groupKey, we will insert in groupKey order
    rows.forEach(row => {
      let groupName = row[groupKey];
      let dataset = this.getJoinedRowValues(columns, row);
      let metricValue = row[metricKey];
      let group = grouped.get(groupName);
      // No definition for nested Map, create and insert now to keep insertion order).
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
    return {
      label: datasetName,
      data: values,
      backgroundColor: this.fixedColor(datasetName),
      borderColor: this.fixedColor(datasetName),
      fill: false
    };
  },

  columnarDataset(column, rows, index) {
    let values = this.getColumnValues(column, rows);
    let dataset = {
      label: column,
      data: values,
      backgroundColor: this.randomColor(),
      borderColor: this.randomColor(),
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

  fixedColor(string) {
    let hash = this.hash(string);
    let colors = [];
    for (let i = 0; i <= 2; ++i, hash = hash >> 8) {
      colors.push(hash >> 8 & 0xFF)
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
    if (s.length === 0) {
      return 0;
    }
    let hash = 0;
    for (let i = 0; i < s.length; ++i) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);;
    }
    return hash;
  },

  actions: {
    saveOptions(options) {
      let model = this.get('model');
      model.set('pivotOptions', JSON.stringify(options));
      model.save();
    }
  }
});

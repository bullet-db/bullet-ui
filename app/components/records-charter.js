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

  notSimpleMode: false,
  simpleMode: not('notSimpleMode').readOnly(),
  cannotModeSwitch: alias('config.isRaw').readOnly(),
  canModeSwitch: not('cannotModeSwitch').readOnly(),
  pivotMode: or('notSimpleMode', 'cannotModeSwitch').readOnly(),
  pivotOptions: computed('config.pivotOptions', function() {
    let options = this.get('config.pivotOptions') || '{}';
    return JSON.parse(options);
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

  timeSeriesMetric: computed('sampleRow', 'columns', function() {
    let { sampleRow, columns } = this.getProperties('sampleRow', 'columns');
    let fieldIndex = columns.findIndex(c => this.isType(sampleRow, c, 'number'));
    return columns.get(fieldIndex);
  }).readOnly(),

  independentColumns: computed('config', 'timeSeriesMode', 'sampleRow', 'columns', function() {
    if (this.get('timeSeriesMode')) {
      return A([WINDOW_CREATED_KEY]);
    }
    let columns = this.get('columns');
    if (this.get('config.isDistribution')) {
      return A(columns.filter(c => this.isAny(c, 'Quantile', 'Range')));
    }
    // Pick all string columns
    let sampleRow = this.get('sampleRow');
    return A(columns.filter(c => this.isType(sampleRow, c, 'string')));
  }).readOnly(),

  dependentColumns: computed('config', 'sampleRow', 'columns', 'timeSeriesMode', 'timeSeriesMetric', function() {
    let columns = this.get('columns');
    if (this.get('timeSeriesMode')) {
      let onlyMetric = this.get('timeSeriesMetric');
      // For time series data, all other columns besides the metric and the injected window keys make up unique time lines
      // If there are no such columns, this is empty.
      return A(columns.filter(c => !this.isAny(c, WINDOW_CREATED_KEY, WINDOW_NUMBER_KEY, onlyMetric)));
    }
    if (this.get('config.isDistribution')) {
      return A(columns.filter(c => this.isAny(c, 'Count', 'Value', 'Probability')));
    }
    // Pick all number columns
    let sampleRow = this.get('sampleRow');
    return A(columns.filter(c => this.isType(sampleRow, c, 'number')));
  }).readOnly(),

  scales: computed('timeSeriesMode', 'dependentColumns', function() {
    // No need for more than one Y Axis
    if (this.get('timeSeriesMode')) {
      return {
        scales: { xAxes: [{ type: 'time' }] }
      };
    }
    if (this.get('dependentColumns.length') > 1) {
      return {
        scales: { yAxes: [{ position: 'left', id: '0' }, { position: 'right', id: '1' }] }
      };
    }
  }).readOnly(),

  defaultOptions: computed('timeSeriesMode', function() {
    let defaults = { };
    if (this.get('timeSeriesMode')) {
      defaults = {
        animation: { duration: 0 },
        hover: { animationDuration: 0 },
        responsiveAnimationDuration: 0,
        elements: {
          line: { tension: 0 }
        }
      };
    }
    return defaults;
  }).readOnly(),

  options: computed('defaultOptions', 'scales', function() {
    return Object.assign({ }, this.get('defaultOptions'), this.get('scales'));
  }).readOnly(),

  labels: computed('independentColumns', 'rows', function() {
    // Only one independent column for now
    let rows = this.get('rows');
    // [ [column1 values...], [column2 values...], ...]
    let valuesList = this.get('independentColumns').map(column => this.getColumnValues(column, rows));
    // valuesList won't be empty because all non-Raw aggregations will have at least one string field
    return this.zip(valuesList);
  }).readOnly(),

  datasets: computed('dependentColumns', 'rows', 'timeSeriesMode', 'timeSeriesMetric', function() {
    let dependentColumns = this.get('dependentColumns');
    let rows = this.get('rows');
    if (this.get('timeSeriesMode')) {
      let metricColumn = this.get('timeSeriesMetric');
      return this.timeSeriesDatasets(metricColumn, dependentColumns, rows);
    }
    return dependentColumns.map((c, i) => this.columnarDataset(c, rows, i));
  }).readOnly(),

  data: computed('labels', 'datasets', function() {
    return {
      labels: this.get('labels'),
      datasets: this.get('datasets')
    };
  }).readOnly(),

  //////////////////////////////////////////////////// Helpers //////////////////////////////////////////////////

  timeSeriesDatasets(metricColumn, columns, rows) {
    // If no columns, then the metricColumn is the only dataset.
    if (isEmpty(columns)) {
      return [this.timeSeriesDataset(metricColumn, rows.map(row => row[metricColumn]))];
    }

    let datasets =  { };
    // If a dataset (a unique set of values for the columns) does not have a timeseries already. Generate one by
    // scanning all rows. This is n^2 in rows. However, if windows share the same values for rows, it should be n
    rows.forEach(row => {
      // Generate a name for the dataset using all the row values in column order
      let dataset = this.getJoinedRowValues(columns, row);
      // Nothing to do if this dataset has already been populated
      if (!isEmpty(datasets[dataset])) {
        return;
      }
      // Add nulls if row does not have the same lineName for its values: [ 13, null, null, -2, null, ...]
      let values = rows.map(row => isEqual(dataset, this.getJoinedRowValues(columns, row)) ? row[metricColumn] : null);
      datasets[dataset] = this.timeSeriesDataset(dataset, values);
    })
    return Object.keys(datasets).map(dataset => datasets[dataset]);
  },

  timeSeriesDataset(datasetName, values) {
    // Picks the same color deterministically for a datasetName
    return {
      label: datasetName,
      data: values,
      backgroundColor: this.fixedColor(datasetName),
      borderColor: this.fixedColor(datasetName),
      spanGaps: true,
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

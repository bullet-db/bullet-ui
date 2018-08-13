/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';

import { isEmpty, isEqual, typeOf } from '@ember/utils';
import { computed } from '@ember/object';
import { not, alias, or } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['records-charter'],
  model: null,
  columns: null,
  rows: null,
  chartType: 'bar',
  config: null,

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
  }),

  independentColumns: computed('config', 'sampleRow', 'columns', function() {
    let { columns, sampleRow } = this.getProperties('columns', 'sampleRow');
    let isDistribution = this.get('config.isDistribution');
    if (isDistribution) {
      return A(columns.filter(c => this.isAny(c, 'Quantile', 'Range')));
    }
    // Pick all string columns
    return A(columns.filter(c => this.isType(sampleRow, c, 'string')));
  }),

  dependentColumns: computed('config', 'sampleRow', 'columns', function() {
    let { columns, sampleRow } = this.getProperties('columns', 'sampleRow');
    let isDistribution = this.get('config.isDistribution');
    if (isDistribution) {
      return A(columns.filter(c => this.isAny(c, 'Count', 'Value', 'Probability')));
    }
    // Pick all number columns
    return A(columns.filter(c => this.isType(sampleRow, c, 'number')));
  }),

  options: computed('dependentColumns', function() {
    let numberOfColumns = this.get('dependentColumns.length');
    if (numberOfColumns === 1) {
      return { };
    }
    // Everything else, 2 axes
    return {
      scales: {
        yAxes: [{
          position: 'left',
          id: '0'
        }, {
          position: 'right',
          id: '1'
        }]
      }
    };
  }),

  labels: computed('independentColumns', 'rows', function() {
    // Only one independent column for now
    let rows = this.get('rows');
    // [ [field1 values...], [field2 values...], ...]
    let valuesList = this.get('independentColumns').map(field => this.getFieldValues(field, rows));
    // valuesList won't be empty because all non-Raw aggregations will have at least one string field
    return this.zip(valuesList);
  }),

  datasets: computed('dependentColumns', 'rows', function() {
    let dependentColumns = this.get('dependentColumns');
    let rows = this.get('rows');
    return dependentColumns.map((c, i) => this.dataset(c, rows, i));
  }),

  data: computed('labels', 'datasets', function() {
    return {
      labels: this.get('labels'),
      datasets: this.get('datasets')
    };
  }),

  dataset(column, rows, index) {
    let values = this.getFieldValues(column, rows);
    let dataset = {
      label: column,
      data: values,
      backgroundColor: this.randomColors(values.length),
      borderColor: this.randomColors(values.length),
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

  randomUpto(size) {
    return Math.floor(Math.random() * size);
  },

  randomColor() {
    let red = this.randomUpto(255);
    let green = this.randomUpto(255);
    let blue = this.randomUpto(255);
    return `rgb(${red},${green},${blue})`;
  },

  randomColors(size) {
    let color = this.randomColor();
    return new Array(size).fill(color);
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

  zip(arrayOfArrays, delimiter = '/') {
    let zipped = arrayOfArrays[0].map((_, i) => arrayOfArrays.map(a => a[i]));
    return zipped.map(a => a.reduce((p, c) => `${p}${delimiter}${c}`), '');
  },

  getFieldValues(field, rows) {
    return rows.map(row => row[field]);
  },

  actions: {
    saveOptions(options) {
      let model = this.get('model');
      model.set('pivotOptions', JSON.stringify(options));
      model.save();
    }
  }
});

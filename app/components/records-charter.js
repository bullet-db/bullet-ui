/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['records-charter'],
  model: null,
  columns: null,
  rows: null,
  chartType: 'bar',
  simpleMode: true,

  cannotModeSwitch: Ember.computed.alias('model.isRaw').readOnly(),
  canModeSwitch: Ember.computed.not('cannotModeSwitch').readOnly(),
  notSimpleMode: Ember.computed.not('simpleMode').readOnly(),
  pivotMode: Ember.computed.or('notSimpleMode', 'cannotModeSwitch').readOnly(),

  sampleRow: Ember.computed('rows', 'columns', function() {
    let typicalRow = { };
    let rows = this.get('rows');
    this.get('columns').forEach(column => {
      for (let row of rows) {
        let value = row[column];
        if (!Ember.isEmpty(value)) {
          typicalRow[column] = value;
          break;
        }
      }
    });
    return typicalRow;
  }),

  independentColumns: Ember.computed('model', 'sampleRow', 'columns', function() {
    let { columns, sampleRow } = this.getProperties('columns', 'sampleRow');
    let isDistribution = this.get('model.isDistribution');
    if (isDistribution) {
      return Ember.A(columns.filter(c => this.isAny(c, 'Quantile', 'Range')));
    }
    // Pick all string columns
    return Ember.A(columns.filter(c => Ember.typeOf(sampleRow[c]) === 'string'));
  }),

  dependentColumns: Ember.computed('model', 'sampleRow', 'columns', function() {
    let { columns, sampleRow } = this.getProperties('columns', 'sampleRow');
    let isDistribution = this.get('model.isDistribution');
    if (isDistribution) {
      return Ember.A(columns.filter(c => this.isAny(c, 'Count', 'Value', 'Probability')));
    }
    // Pick all number columns
    return Ember.A(columns.filter(c => Ember.typeOf(sampleRow[c]) === 'number'));
  }),

  options: Ember.computed('dependentColumns', function() {
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

  labels: Ember.computed('independentColumns', 'rows', function() {
    // Only one independent column for now
    let rows = this.get('rows');
    // [ [field1 values...], [field2 values...], ...]
    let valuesList = this.get('independentColumns').map(field => this.getFieldValues(field, rows));
    return this.zip(valuesList);
  }),

  datasets: Ember.computed('dependentColumns', 'rows', function() {
    let dependentColumns = this.get('dependentColumns');
    let rows = this.get('rows');
    return dependentColumns.map((c, i) => this.dataset(c, rows, i));
  }),

  data: Ember.computed('labels', 'datasets', function() {
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
      backgroundColor: this.randomColors(values.length)
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
    return Ember.isEqual(Ember.typeOf(row[field]), type);
  },

  isAny(field, ...values) {
    for (let value of values) {
      if (Ember.isEqual(field, value)) {
        return true;
      }
    }
    return false;
  },

  zip(arrayOfArrays, delimiter = '/') {
    if (Ember.isEmpty(arrayOfArrays)) {
      return [];
    }
    let zipped =  arrayOfArrays[0].map((_, i) => arrayOfArrays.map(a => a[i]));
    return zipped.map(a => a.reduce((p, c) => `${p}${delimiter}${c}`), '');
  },

  getFieldValues(field, rows, round = false) {
    let values = rows.map(row => row[field]);
    if (round) {
      values = values.map(v => v.toFixed(4));
    }
    return values;
  },

  actions: {
    toggleMode() {
      this.toggleProperty('simpleMode');
    }
  }
});

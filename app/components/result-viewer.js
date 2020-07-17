/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { action, computed } from '@ember/object';
import { alias, and, or, not } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';

export const WINDOW_NUMBER_KEY = 'Window Number';
export const WINDOW_CREATED_KEY = 'Window Created';

export default class ResultViewerComponent extends Component {
  @service querier;

  @tracked selectedWindow;
  @tracked autoUpdate = true;
  @tracked timeSeriesMode = false;
  // Tweaks the time for the window duration by this to adjust for Ember scheduling delays
  jitter = -300;
  settings;

  // Computed Properties
  @alias('querier.isRunningQuery') isRunningQuery;
  @alias('args.result.isRaw') isRaw;
  @alias('args.result.hasData') hasData;
  @alias('args.result.hasError') hasError;
  @alias('args.result.errorWindow') errorWindow;
  @alias('args.query.isWindowless') hasNoWindow;
  @alias('args.result.windows.length') numberOfWindows;
  @alias('args.query.window.isTimeBased') isTimeWindow;

  @not('hasError') hasNoError;
  @not('isTimeWindow') isRecordWindow;
  @and('isRecordWindow', 'isRaw') isRawRecordWindow;
  @alias('isRawRecordWindow') appendRecordsMode;
  @not('appendRecordsMode') notAppendRecordsMode;
  @or('appendRecordsMode', 'timeSeriesMode') aggregateMode;
  @and('hasData', 'hasNoError') showData;
  @and('showData', 'isTimeWindow') showTimeSeries;
  @and('showData', 'notAppendRecordsMode') showAutoUpdate;

  constructor() {
    super(...arguments);
    this.settings = getOwner(this).lookup('settings:main');
  }

  get queryDuration() {
    return this.args.query.get('duration') * 1000;
  }

  get windowDuration() {
    return this.jitter + (this.args.query.get('window.emitEvery') * 1000);
  }

  get config() {
    return {
      isRaw: this.args.result.get('isRaw'),
      isReallyRaw: this.args.result.get('result.isReallyRaw'),
      isDistribution: this.args.result.get('result.isDistribution'),
      isSingleRow: this.args.result.get('result.isSingleRow'),
      pivotOptions: this.args.result.get('result.pivotOptions')
    };
  }

  get metadata() {
    return this.hasError ? this.errorWindow : this.getSelectedWindow('metadata', this.autoUpdate);
  }

  get records() {
    if (this.appendRecordsMode) {
      return this.getAllWindowRecords();
    }
    return this.timeSeriesMode ? this.getTimeSeriesRecords() : this.getSelectedWindow('records', this.autoUpdate);
  }

  getSelectedWindow(property, autoUpdate) {
    let windowProperty = this.args.result.get(`windows.lastObject.${property}`);
    if (!autoUpdate && !isNone(this.selectedWindow)) {
      windowProperty = this.selectedWindow[property];
    }
    return windowProperty;
  }

  getAllWindowRecords() {
    let records = [];
    let windows = this.args.result.get('windows');
    for (let i = 0; i < windows.length; ++i) {
      records.push(...windows[i].records);
    }
    return records;
  }

  getTimeSeriesRecords() {
    let records = [];
    let windows = this.args.result.get('windows');
    for (let i = 0; i < windows.length; ++i) {
      let windowEntry = windows[i];
      let extraColumns = {
        [WINDOW_NUMBER_KEY]: windowEntry.sequence ? windowEntry.sequence : windowEntry.position,
        [WINDOW_CREATED_KEY]: windowEntry.created
      };
      // Copy the extra columns and the columns from the record into a new object
      windowEntry.records.forEach(record => records.push(Object.assign({ }, extraColumns, record)));
    }
    return records;
  }

  @action
  changeWindow(selectedWindow) {
    this.selectedWindow = selectedWindow;
    this.autoUpdate = false;
  }

  @action
  changeAutoUpdate(autoUpdate) {
    this.autoUpdate = autoUpdate;
    // Turn On or if aggregating (and turn off) => reset selectedWindow. Turn Off => Last window
    let aggregateMode = this.aggregateMode;
    this.selectedWindow = autoUpdate || aggregateMode ? null : this.args.result.get('windows.lastObject');
  }

  @action
  changeTimeSeriesMode(timeSeriesMode) {
    this.timeSeriesMode = timeSeriesMode;
    this.selectedWindow = timeSeriesMode || this.autoUpdate ? null : this.args.result.get('windows.lastObject');
  }
}

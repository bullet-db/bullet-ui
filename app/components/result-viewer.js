/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias, and, or, not } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isNone } from '@ember/utils';

export const WINDOW_NUMBER_KEY = 'Window Number';
export const WINDOW_CREATED_KEY = 'Window Created';

export default Component.extend({
  classNames: ['result-viewer'],
  querier: service(),

  query: null,
  result: null,
  selectedWindow: null,
  autoUpdate: true,
  timeSeriesMode: false,
  // Tweaks the time for the window duration by this to adjust for Ember scheduling delays
  jitter: -300,

  // Cache to store all the records when aggregating records across windows. Computed properties to recompute
  // all the records is not a good option. This is an alternative to observers. These properties are modified by
  // computed properties and shouldn't be dependencies of other properties. This is currently reset when receiving
  // new attrs or when turning on timeSeriesMode (not on appendRecordsMode since that can't change without changing
  // the query).
  recordsCache: [],
  windowsInCache: 0,

  // Computed Properties
  isRunningQuery: alias('querier.isRunningQuery').readOnly(),
  isRaw: alias('result.isRaw').readOnly(),
  errorWindow: alias('result.errorWindow').readOnly(),
  hasData: alias('result.hasData').readOnly(),
  numberOfWindows: alias('result.windows.length').readOnly(),
  windowEmitEvery: alias('query.window.emit.every').readOnly(),
  isTimeWindow: alias('query.window.isTimeBased').readOnly(),
  isRecordWindow: not('isTimeWindow').readOnly(),
  isRawRecordWindow: and('isRecordWindow', 'isRaw').readOnly(),
  appendRecordsMode: alias('isRawRecordWindow').readOnly(),
  aggregateMode: or('appendRecordsMode', 'timeSeriesMode').readOnly(),

  showData: computed('hasData', 'hasError', function() {
    return this.get('hasData') && !this.get('hasError');
  }).readOnly(),

  hasError: computed('errorWindow', function() {
    return !isNone(this.get('errorWindow'));
  }).readOnly(),

  showAutoUpdate: computed('showData', 'appendRecordsMode', function() {
    return this.get('showData') && !this.get('appendRecordsMode');
  }).readOnly(),

  showTimeSeries: and('showData', 'isTimeWindow').readOnly(),

  metadata: computed('hasError', 'autoUpdate', 'selectedWindow', 'result.windows.[]', function() {
    let autoUpdate = this.get('autoUpdate');
    return this.get('hasError') ? this.get('errorWindow.metadata') : this.getSelectedWindow('metadata', autoUpdate);
  }).readOnly(),

  records: computed('appendRecordsMode', 'timeSeriesMode', 'result.windows.[]', 'selectedWindow', 'autoUpdate', function() {
    // Deliberately not depending on the cache
    if (this.get('appendRecordsMode')) {
      return this.getAllWindowRecords();
    }
    let autoUpdate = this.get('autoUpdate');
    if (this.get('timeSeriesMode')) {
      return autoUpdate ? this.getTimeSeriesRecords(WINDOW_NUMBER_KEY, WINDOW_CREATED_KEY) : this.get('recordsCache');
    } else {
      return this.getSelectedWindow('records', autoUpdate);
    }
  }).readOnly(),

  queryDuration: computed('query.duration', function() {
    return this.get('query.duration') * 1000;
  }).readOnly(),

  windowDuration: computed('windowEmitEvery', function() {
    return this.get('jitter') + (this.get('windowEmitEvery') * 1000);
  }).readOnly(),

  config: computed('result.{isRaw,isReallyRaw,isDistribution,isSingleRow}', function() {
    return {
      isRaw: this.get('result.isRaw'),
      isReallyRaw: this.get('result.isReallyRaw'),
      isDistribution: this.get('result.isDistribution'),
      isSingleRow: this.get('result.isSingleRow'),
      pivotOptions: this.get('result.pivotOptions')
    };
  }).readOnly(),

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('selectedWindow', null);
    this.set('autoUpdate', true);
    this.set('timeSeriesMode', false);
    this.resetCache();
  },

  getSelectedWindow(property, autoUpdate) {
    let windowProperty = this.get(`result.windows.lastObject.${property}`);
    if (!autoUpdate) {
      let selectedWindow = this.get('selectedWindow');
      windowProperty = isNone(selectedWindow) ? windowProperty : selectedWindow[property];
    }
    return windowProperty;
  },

  getAllWindowRecords() {
    // Add all unadded windows' records to the cache and return a new copy
    return this.updateRecordsCache((c, w) => c.push(...w.records));
  },

  getTimeSeriesRecords(numberKey, createdKey) {
    // Add all unadded windows' records with injected dimensions to the cache and return a new copy
    return this.updateRecordsCache(this.addNewTimeSeriesWindow(numberKey, createdKey))
  },

  addNewTimeSeriesWindow(numberKey, createdKey) {
    return (cache, windowEntry) => {
      let extraColumns = {
        [numberKey]:  windowEntry.sequence ? windowEntry.sequence : windowEntry.position,
        [createdKey]: windowEntry.created
      };
      // Copy the extra columns and the columns from the record into a new object
      windowEntry.records.forEach(record => cache.push(Object.assign({ }, extraColumns, record)));
    };
  },

  updateRecordsCache(addWindowRecordsFunction) {
    let cache = this.get('recordsCache');
    let windows = this.get('result.windows');
    let windowsInCache = this.get('windowsInCache');
    let allWindows = windows.length;
    if (windowsInCache < windows.length) {
      // Start at X in windows if there are X windows in cache (at positions 0 - X-1)
      for (let i = windowsInCache; i < allWindows; ++i) {
        // Expects cache to be updated
        addWindowRecordsFunction(cache, windows[i]);
      }
      this.set('windowsInCache', allWindows);
    }
    // Have to return a copy of the cache to cache bust the computed property
    return [].concat(cache);
  },

  resetCache() {
    this.set('recordsCache', []);
    this.set('windowsInCache', 0);
  },

  actions: {
    changeWindow(selectedWindow) {
      this.set('selectedWindow', selectedWindow);
      this.set('autoUpdate', false);
    },

    changeAutoUpdate(autoUpdate) {
      // Turn On => reset selectedWindow. Turn Off => Last window
      this.set('autoUpdate', autoUpdate);
      this.set('selectedWindow', autoUpdate ? null : this.get('result.windows.lastObject'));
    },

    changeTimeSeriesMode(timeSeriesMode) {
      if (timeSeriesMode) {
        this.set('selectedWindow', null);
      }
      this.set('timeSeriesMode', timeSeriesMode);
    }
  }
});

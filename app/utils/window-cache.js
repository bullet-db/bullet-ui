/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
export const WINDOW_NUMBER_KEY = 'Window Number';
export const WINDOW_CREATED_KEY = 'Window Created';

export default class WindowCache {
  cache;
  windowsInCache;

  constructor() {
    this.reset();
  }

  getAllAvailableRecords() {
    return this.copyCache();
  }

  getAllRecordsFrom(windows) {
    return this.getRecordsFromWindows(windows, (w) => w.records);
  }

  getAllTimeSeriesRecordsFrom(windows) {
    return this.getRecordsFromWindows(windows, this.asTimeSeries(WINDOW_NUMBER_KEY, WINDOW_CREATED_KEY));
  }

  asTimeSeries(numberKey, createdKey) {
    return (windowEntry) => {
      let extraColumns = {
        [numberKey]: windowEntry.sequence ? windowEntry.sequence : windowEntry.index,
        [createdKey]: windowEntry.created
      };
      // Copy the extra columns and the columns from the record into a new object
      return windowEntry.records.map(record => Object.assign({ }, extraColumns, record));
    };
  }

  getRecordsFromWindows(windows, windowToRecordsMapper) {
    let numberOfWindows = windows ? windows.length : 0;
    if (this.windowsInCache < numberOfWindows) {
      // Start at X in windows if there are X windows in cache (at positions 0 - X-1)
      for (let i = this.windowsInCache; i < numberOfWindows; ++i) {
        let records = windowToRecordsMapper(windows[i]);
        this.cache.push(...records);
      }
      this.windowsInCache = numberOfWindows;
    }
    return this.copyCache();
  }

  copyCache() {
    return [].concat(this.cache);
  }

  reset() {
    this.windowsInCache = 0;
    this.cache = [];
  }
}

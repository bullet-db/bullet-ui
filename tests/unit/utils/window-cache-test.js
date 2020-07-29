/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty, isEqual } from '@ember/utils';
import { module, test } from 'qunit';
import WindowCache, { WINDOW_NUMBER_KEY, WINDOW_CREATED_KEY } from 'bullet-ui/utils/window-cache';

module('Unit | Utility | window cache', function() {
  test('it sets its defaults right', function(assert) {
    let subject = new WindowCache();
    assert.equal(subject.windowsInCache, 0);
    assert.ok(isEmpty(subject.getAllAvailableRecords()));
  });

  test('it caches when it gets all the records from given windows', function(assert) {
    let subject = new WindowCache();
    assert.ok(isEmpty(subject.getAllRecordsFrom([])));
    assert.equal(subject.windowsInCache, 0);
    let windows = [{ records: [1] }, { records: [2] }, { records: [3] }];
    let records = subject.getAllRecordsFrom(windows);
    assert.equal(subject.windowsInCache, 3);
    assert.deepEqual(records, [1, 2, 3]);
    assert.deepEqual(subject.getAllAvailableRecords(), [1, 2, 3]);

    // The first 3 will be picked up from the cache
    windows = [{ records: [0] }, { records: [0] }, { records: [0] }, { records: [4]}];
    records = subject.getAllRecordsFrom(windows);
    assert.deepEqual(records, [1, 2, 3, 4]);
    assert.deepEqual(subject.getAllAvailableRecords(), [1, 2, 3, 4]);
    assert.equal(subject.windowsInCache, 4);
  });

  test('it caches and adds more fields when it gets timeseries records from given windows', function(assert) {
    let subject = new WindowCache();
    assert.ok(isEmpty(subject.getAllRecordsFrom([])));
    assert.equal(subject.windowsInCache, 0);
    let date = Date.now();
    let windows = [
      { records: [{ a: 1 }], sequence: 1, created: date },
      { records: [{ a: 2 }], sequence: 2, created: date },
      { records: [{ a: 3 }], index: 3, created: date }
    ];
    let records = subject.getAllTimeSeriesRecordsFrom(windows);
    let expected = [
      {a: 1, [WINDOW_NUMBER_KEY]: 1, [WINDOW_CREATED_KEY]: date },
      {a: 2, [WINDOW_NUMBER_KEY]: 2, [WINDOW_CREATED_KEY]: date },
      {a: 3, [WINDOW_NUMBER_KEY]: 3, [WINDOW_CREATED_KEY]: date }
    ];
    assert.equal(subject.windowsInCache, 3);
    assert.deepEqual(records, expected);
    assert.deepEqual(subject.getAllAvailableRecords(), expected);

    // The first 3 will be picked up from the cache
    windows = [
      { records: [{ a: 0 }], sequence: 0, created: date },
      { records: [{ a: 0 }], sequence: 0, created: date },
      { records: [{ a: 0 }], index: 0, created: date },
      { records: [{ a: 4 }], sequence: 4, created: date }
    ];
    expected = [
      {a: 1, [WINDOW_NUMBER_KEY]: 1, [WINDOW_CREATED_KEY]: date },
      {a: 2, [WINDOW_NUMBER_KEY]: 2, [WINDOW_CREATED_KEY]: date },
      {a: 3, [WINDOW_NUMBER_KEY]: 3, [WINDOW_CREATED_KEY]: date },
      {a: 4, [WINDOW_NUMBER_KEY]: 4, [WINDOW_CREATED_KEY]: date }
    ];
    records = subject.getAllTimeSeriesRecordsFrom(windows);
    assert.deepEqual(records, expected);
    assert.deepEqual(subject.getAllAvailableRecords(), expected);
    assert.equal(subject.windowsInCache, 4);
  });
});

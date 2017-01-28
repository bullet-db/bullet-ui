/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { mockAPI } from '../helpers/pretender';

let server;

moduleForAcceptance('Acceptance | query results lifecycle', {
  beforeEach() {
    return window.localforage.setDriver(window.localforage.LOCALSTORAGE);
  },

  afterEach() {
    // Wipe out localstorage because we are creating here
    if (server) {
      server.shutdown();
    }
    return window.localforage.clear();
  }
});

test('query submission and result navigation', function(assert) {
  assert.expect(3);
  server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);
  visit('queries/new');
  click('.submit-button');

  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
  });
  click('.queries-table .query-results-entry');
  click('.query-results-entry-popover .results-table .result-date-entry');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('pre').length, 1);
  });
});

test('query submission with projections opens the table view by default', function(assert) {
  assert.expect(2);
  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);

  visit('/queries/new');
  click('.projections-container .projection-options #select');
  selectChoose('.projections-container .projection-field', 'simple_column');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('.records-table').length, 1);
  });
});

test('result table popover open and close', function(assert) {
  assert.expect(2);
  server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);
  visit('queries/new');
  click('.submit-button');

  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
  });
  click('.queries-table .query-results-entry');
  click('.query-results-entry-popover .close-button');
  click('.queries-table .query-results-entry');
  click('.query-results-entry-popover .results-table .result-number-entry');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
  });
});

test('query multiple submissions and results clearing', function(assert) {
  assert.expect(2);
  server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);
  visit('queries/new');
  click('.submit-button');
  visit('queries');
  click('.queries-table .query-name-entry .query-name-actions .edit-icon');
  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '2 Results');
  });
  click('.queries-table .query-results-entry');
  click('.query-results-entry .clear-history');
  andThen(() => {
    assert.equal(find('.queries-table .query-results-entry').text().trim(), '--');
  });
});

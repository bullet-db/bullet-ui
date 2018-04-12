/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { mockAPI } from '../helpers/pretender';

let server;

moduleForAcceptance('Acceptance | query results lifecycle', {
  suppressLogging: true,

  beforeEach() {
    // Wipe out localstorage because we are creating queries here
    window.localStorage.clear();
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
  }
});

test('query submission and result navigation', function(assert) {
  assert.expect(3);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.MULTIPLE);
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

test('query submission with raw output with projections opens the table view by default', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.SINGLE);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('.records-table').length, 1);
  });
});

test('query submission with grouped data opens the table view by default', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.GROUP);

  visit('/queries/new');
  click('.output-options #grouped-data');
  click('.output-container .groups-container .add-group');
  selectChoose('.output-container .groups-container .field-selection-container .field-selection', 'complex_map_column');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('.records-table').length, 1);
  });
});

test('result table popover open and close', function(assert) {
  assert.expect(3);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.MULTIPLE);
  visit('queries/new');
  click('.submit-button');

  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
  });
  click('.queries-table .query-results-entry');
  andThen(() => {
    assert.equal(find('.query-results-entry-popover').length, 1);
  });
  click('.query-results-entry-popover .close-button');
  // Bootstrap popovers hiding is async but andThen doesn't catch it (May need to wrap closePopover in a run loop)...
  Ember.run.next(() => {
    andThen(() => {
      assert.equal(find('.query-results-entry-popover .results-table .result-date-entry').length, 0);
    });
  });
});

test('query multiple submissions and results clearing', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.MULTIPLE);
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

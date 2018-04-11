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
import mockWebsocket from '../../tests/helpers/mock-websocket';

let server, mockSocket;

moduleForAcceptance('Acceptance | result lifecycle', {
  suppressLogging: true,

  beforeEach() {
    this.application.register('service:mockWebsocket', mockWebsocket);
    this.application.inject('service:querier', 'websocket', 'service:mockWebsocket');
    mockSocket = this.application.__container__.lookup('service:mockWebsocket');

    // Wipe out localstorage because we are creating queries here
    window.localStorage.clear();
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
  }
});

test('it has a link to go back to the query from the result', function(assert) {
  assert.expect(2);

  server = mockAPI(COLUMNS.BASIC);
  mockSocket.mockAPI(RESULTS.SINGLE);
  let createdQuery;
  visit('/queries/new').then(() => {
    createdQuery = currentURL();
  });
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
  });
  click('.query-blurb-wrapper');
  andThen(() => {
    assert.equal(currentURL(), createdQuery);
  });
});

test('it lets you swap between raw and tabular forms', function(assert) {
  assert.expect(4);

  server = mockAPI(COLUMNS.BASIC);
  mockSocket.mockAPI(RESULTS.MULTIPLE);

  visit('/queries/new');
  click('.submit-button');
  click('.table-view');
  andThen(() => {
    assert.equal(find('.pretty-json-container').length, 0);
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 9);
  });
  click('.raw-view');
  andThen(() => {
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(find('.pretty-json-container').length, 1);
  });
});

test('it lets you expand metadata in results', function(assert) {
  assert.expect(7);
  server = mockAPI(COLUMNS.BASIC);
  mockSocket.mockAPI(RESULTS.COUNT_DISTINCT);

  visit('/queries/new');
  click('.output-options #count-distinct');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('.records-table').length, 1);
    assert.equal(find('.result-metadata').length, 1);
    assert.notOk(find('.result-metadata').hasClass('is-expanded'));
    assert.equal(find('.result-metadata pre').length, 0);
    click('.result-metadata .expand-bar');
    andThen(() => {
      assert.ok(find('.result-metadata').hasClass('is-expanded'));
      assert.equal(find('.result-metadata pre').length, 1);
    });
  });
});

test('it lets you expand result entries in a popover', function(assert) {
  assert.expect(4);
  server = mockAPI(COLUMNS.BASIC);
  mockSocket.mockAPI(RESULTS.SINGLE);

  visit('/queries/new');
  click('.submit-button');
  click('.table-view');
  andThen(() => {
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 3);
  });
  click('.records-table .lt-body .lt-row .record-entry .plain-entry:contains("test")');
  andThen(() => {
    assert.equal(find('.record-entry-popover').length, 1);
    assert.equal(find('.record-entry-popover .record-popover-body pre').text().trim(), 'test');
  });
  click('.record-entry-popover .close-button');
  // Bootstrap popovers hiding is async but andThen doesn't catch it (May need to wrap closePopover in a run loop)...
  Ember.run.next(() => {
    andThen(() => {
      assert.equal(find('.record-entry-popover').length, 0);
    });
  });
});

test('it lets swap between a row, tabular and pivot chart views when it is a raw query', function(assert) {
  assert.expect(12);

  server = mockAPI(COLUMNS.BASIC);
  mockSocket.mockAPI(RESULTS.MULTIPLE);

  visit('/queries/new');
  click('.submit-button');
  click('.table-view');
  andThen(() => {
    assert.equal(find('.records-charter').length, 0);
    assert.equal(find('.pretty-json-container').length, 0);
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 9);
  });
  click('.raw-view');
  andThen(() => {
    assert.equal(find('.records-charter').length, 0);
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(find('.pretty-json-container').length, 1);
  });
  click('.chart-view');
  andThen(() => {
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(find('.pretty-json-container').length, 0);
    assert.equal(find('.records-charter').length, 1);
    assert.equal(find('.pivot-table-container').length, 1);
    assert.equal(find('.pvtUi').length, 1);
    // Only pivot view
    assert.equal(find('.records-chater .mode-toggle').length, 0);
  });
});

test('it lets swap between a row, tabular, simple and pivot chart views when it is not a raw query', function(assert) {
  assert.expect(15);

  server = mockAPI(COLUMNS.BASIC);
  mockSocket.mockAPI(RESULTS.DISTRIBUTION);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.output-container .distribution-point-options #points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-points input', '0,0.2,1');
  click('.submit-button');

  click('.raw-view');
  andThen(() => {
    assert.equal(find('.records-charter').length, 0);
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(find('.pretty-json-container').length, 1);
  });
  click('.table-view');
  andThen(() => {
    assert.equal(find('.records-charter').length, 0);
    assert.equal(find('.pretty-json-container').length, 0);
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 9);
  });
  click('.chart-view');
  andThen(() => {
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(find('.pretty-json-container').length, 0);
    assert.equal(find('.records-charter').length, 1);
    assert.equal(find('.records-charter .mode-toggle').length, 1);
    assert.ok(find('.mode-toggle .left-view').hasClass('selected'));
    assert.equal(find('.records-charter canvas').length, 1);
  });
  click('.mode-toggle .right-view');
  andThen(() => {
    assert.ok(find('.mode-toggle .right-view').hasClass('selected'));
    assert.equal(find('.pivot-table-container').length, 1);
    assert.equal(find('.pvtUi').length, 1);
  });
});

test('it saves and restores pivot table options', function(assert) {
  assert.expect(7);

  server = mockAPI(COLUMNS.BASIC);
  mockSocket.mockAPI(RESULTS.DISTRIBUTION);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.output-container .distribution-point-options #points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-points input', '0,0.2,1');
  click('.submit-button');

  click('.chart-view');
  click('.mode-toggle .right-view');
  andThen(() => {
    assert.ok(find('.mode-toggle .right-view').hasClass('selected'));
    assert.equal(find('.pivot-table-container').length, 1);
    assert.equal(find('.pvtUi').length, 1);
    assert.equal(find('.pvtUi select.pvtRenderer').val(), 'Table');
    find('.pivot-table-container select.pvtRenderer').val('Bar Chart').trigger('change');
    find('.pivot-table-container select.pvtAggregator').val('Sum').trigger('change');
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
  });
  click('.queries-table .query-results-entry');
  click('.query-results-entry-popover .results-table .result-date-entry');
  click('.chart-view');
  click('.mode-toggle .right-view');
  andThen(() => {
    assert.equal(find('.pvtUi select.pvtRenderer').val(), 'Bar Chart');
    assert.equal(find('.pvtUi select.pvtAggregator').val(), 'Sum');
  });
});

test('it lets you swap between raw and collapsible json forms', function(assert) {
  assert.expect(10);

  server = mockAPI(COLUMNS.BASIC);
  mockSocket.mockAPI(RESULTS.MULTIPLE);

  visit('/queries/new');
  click('.submit-button');
  andThen(() => {
    assert.equal(find('.records-charter').length, 0);
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(find('.raw-display').length, 1);
    assert.equal(find('.pretty-json-container').length, 1);
    assert.equal(find('.raw-json-display').length, 0);
  });
  click('.mode-toggle .right-view');
  andThen(() => {
    assert.equal(find('.records-charter').length, 0);
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(find('.raw-display').length, 1);
    assert.equal(find('.pretty-json-container').length, 0);
    assert.equal(find('.raw-json-display').length, 1);
  });
});

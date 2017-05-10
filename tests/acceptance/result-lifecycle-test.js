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

moduleForAcceptance('Acceptance | result lifecycle', {
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

test('it has a link to go back to the query from the result', function(assert) {
  assert.expect(2);

  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);
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

  server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);

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
  server = mockAPI(RESULTS.COUNT_DISTINCT, COLUMNS.BASIC);

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

test('it lets swap between a row, tabular and advanced chart views when it is a raw query', function(assert) {
  assert.expect(12);

  server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);

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

test('it lets swap between a row, tabular, simple and advanced chart views when it is not a raw query', function(assert) {
  assert.expect(15);

  server = mockAPI(RESULTS.DISTRIBUTION, COLUMNS.BASIC);

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
    assert.ok(find('.mode-toggle .simple-view').hasClass('selected'));
    assert.equal(find('.records-charter canvas').length, 1);
  });
  click('.mode-toggle .advanced-view');
  andThen(() => {
    assert.ok(find('.mode-toggle .advanced-view').hasClass('selected'));
    assert.equal(find('.pivot-table-container').length, 1);
    assert.equal(find('.pvtUi').length, 1);
  });
});

test('it saves and restores pivot table options', function(assert) {
  assert.expect(7);

  server = mockAPI(RESULTS.DISTRIBUTION, COLUMNS.BASIC);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.output-container .distribution-point-options #points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-points input', '0,0.2,1');
  click('.submit-button');

  click('.chart-view');
  click('.mode-toggle .advanced-view');
  andThen(() => {
    assert.ok(find('.mode-toggle .advanced-view').hasClass('selected'));
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
  click('.mode-toggle .advanced-view');
  andThen(() => {
    assert.equal(find('.pvtUi select.pvtRenderer').val(), 'Bar Chart');
    assert.equal(find('.pvtUi select.pvtAggregator').val(), 'Sum');
  });
});

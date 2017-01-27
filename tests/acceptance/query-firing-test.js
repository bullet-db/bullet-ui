/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { mockAPI, failAPI } from '../helpers/pretender';

let server;

moduleForAcceptance('Acceptance | query firing', {
  afterEach() {
    // Wipe out localstorage because we are creating here
    if (server) {
      server.shutdown();
    }
    window.localStorage.clear();
  }
});

test('query firing and redirecting to result', function(assert) {
  assert.expect(1);
  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);

  visit('queries/new');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
  });
});

test('query firing and result accessible through historical queries', function(assert) {
  let data;

  assert.expect(6);
  server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);

  visit('queries/new');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    data = find('pre').text();
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 1);
    assert.notEqual(find('.queries-table .query-date-entry').text().trim(), '--');
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
  });
  click('.queries-table .query-results-entry');
  click('.result-date-entry');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('pre').text(), data);
  });
});

test('query firing and redirecting to error', function(assert) {
  assert.expect(1);
  server = failAPI(COLUMNS.BASIC);
  visit('queries/new');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'errored');
  });
});

test('creating, deleting query filters and projections and saving', function(assert) {
  assert.expect(5);
  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  click('.filter-container button[data-delete=\'rule\']');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('simple_column').trigger('change');
  });
  andThen(() => {
    fillIn('.filter-container .rule-value-container input', 'foo,bar');
    click('.projections-container .projection-options #select');
    click('.projections-container .add-button');
    click('.projections-container .add-button');
    // Deletes everything
    click('.projections-container .projection-options #all');
    click('.projections-container .projection-options #select');
    click('.projections-container .delete-button');
    click('.projections-container .add-button');
    selectChoose('.projections-container .projection-field', 'simple_column');
    click('.save-button');
    visit('queries');
    click('.queries-table .query-name-entry');
  });
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'simple_column');
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal(find('.filter-container .rule-value-container input').val(), 'foo,bar');
    assert.equal(find('.projections-container .projection-field .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    // Test that the projection name was autofilled
    assert.equal(find('.projections-container .projection-name input').val(), 'simple_column');
  });
});

test('creating a query, adding filters and projections, and save on submit', function(assert) {
  assert.expect(6);
  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('simple_column').trigger('change');
  });
  andThen(() => {
    fillIn('.filter-container .rule-value-container input', 'foo,bar');
    click('.projections-container .projection-options #select');
    // It should have added a column already
    selectChoose('.projections-container .projection-field', 'complex_map_column.*');
    fillIn('.projections-container .projection-field .column-subfield input', 'foo');
    triggerEvent('.projections-container .projection-field .column-subfield input', 'blur');
    click('.submit-button');
    visit('queries');
    click('.queries-table .query-name-entry');
  });
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'simple_column');
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal(find('.filter-container .rule-value-container input').val(), 'foo,bar');
    assert.equal(find('.projections-container .projection-field .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .projection-field .column-subfield input').val(), 'foo');
    // Test that the projection name was autofilled
    assert.equal(find('.projections-container .projection-name input').val(), 'complex_map_column.foo');
  });
});

test('creating a query with a filter subfield column filled', function(assert) {
  assert.expect(4);
  server = mockAPI(RESULTS.RAW, COLUMNS.BASIC);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_map_column.*').trigger('change');
  });
  andThen(() => {
    fillIn('.filter-container .rule-subfield-container input', 'foo');
    fillIn('.filter-container .rule-value-container input', 'bar');
    click('.submit-button');
  });
  visit('queries');
  click('.queries-table .query-name-entry');
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_map_column.*');
    assert.equal(find('.filter-container .rule-subfield-container input').val(), 'foo');
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal(find('.filter-container .rule-value-container input').val(), 'bar');
  });
});

test('creating a query with a filter subfield column not filled', function(assert) {
  assert.expect(4);
  server = mockAPI(RESULTS.RAW, COLUMNS.BASIC);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_map_column.*').trigger('change');
  });
  fillIn('.filter-container .rule-value-container input', 'bar');
  click('.submit-button');
  visit('queries');
  click('.queries-table .query-name-entry');
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_map_column.*');
    assert.equal(find('.filter-container .rule-subfield-container input').val(), '');
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal(find('.filter-container .rule-value-container input').val(), 'bar');
  });
});

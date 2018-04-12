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

moduleForAcceptance('Acceptance | query summarization', {
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

test('it summarizes a blank query', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.SINGLE);

  visit('/queries/new');
  click('.save-button');
  visit('queries');

  andThen(function() {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(), 'Fields:  All');
  });
});

test('it summarizes a query with filters', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.SINGLE);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  click('.filter-container button[data-add=\'group\']');
  click('.filter-container .rules-group-container .rules-group-container button[data-add=\'rule\']');
  andThen(() => {
    // Both the top level and nested filter should be filled out now
    find('.filter-container .rule-filter-container select').val('complex_map_column').trigger('change');
  });
  click('.save-button');
  visit('queries');

  andThen(function() {
    assert.equal(find('.query-description .filter-summary-text').text().trim(),
          'Filters:  complex_map_column IS NULL AND ( complex_map_column IS NULL AND complex_map_column IS NULL )');
    assert.equal(find('.query-description .fields-summary-text').text().trim(), 'Fields:  All');
  });
});

test('it summarizes a query with raw fields', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.SINGLE);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');

  selectChoose('.projections-container .field-selection-container:eq(0) .field-selection', 'complex_map_column.*');
  fillIn('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'foo');
  triggerEvent('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'blur');
  fillIn('.projections-container .field-selection-container .field-name input', 'new_name');

  click('.output-container .projections-container .add-projection');
  selectChoose('.projections-container .field-selection-container:eq(1) .field-selection', 'simple_column');

  click('.output-container .projections-container .add-projection');
  selectChoose('.projections-container .field-selection-container:eq(2) .field-selection', 'complex_map_column.*');
  fillIn('.projections-container .field-selection-container:eq(2) .field-selection .column-subfield input', 'bar');
  triggerEvent('.projections-container .field-selection-container:eq(2) .field-selection .column-subfield input', 'blur');

  click('.save-button');
  visit('queries');

  andThen(function() {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  new_name, simple_column, complex_map_column.bar');
  });
});

test('it summarizes a count distinct query', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.COUNT_DISTINCT);

  visit('/queries/new');
  click('.output-options #count-distinct');
  click('.output-container .fields-selection-container .add-field');
  click('.output-container .fields-selection-container .add-field');
  selectChoose('.output-container .field-selection-container:eq(0) .field-selection', 'simple_column');
  selectChoose('.output-container .field-selection-container:eq(1) .field-selection', 'complex_map_column');
  fillIn('.output-container .count-distinct-display-name input', 'cnt');
  click('.save-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  Count Distinct ON (simple_column, complex_map_column)');
  });
});

test('it summarizes a distinct query', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.GROUP);

  visit('/queries/new');
  click('.output-options #grouped-data');

  click('.groups-container .add-group');
  selectChoose('.groups-container .field-selection-container:eq(0) .field-selection', 'complex_map_column.*');
  fillIn('.groups-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'foo');
  triggerEvent('.groups-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'blur');

  click('.groups-container .add-group');
  selectChoose('.groups-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.groups-container .field-selection-container:eq(1) .field-name input', 'bar');

  click('.save-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  complex_map_column.foo, bar');
  });
});

test('it summarizes a group all query', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.GROUP);

  visit('/queries/new');
  click('.output-options #grouped-data');

  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(0) .metrics-selection', 'Count');

  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(1) .metrics-selection', 'Average');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.output-container .metrics-container .field-selection-container:eq(1) .field-name input', 'avg_s');

  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(2) .metrics-selection', 'Average');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(2) .field-selection', 'simple_column');

  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(3) .metrics-selection', 'Sum');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(3) .field-selection', 'simple_column');

  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(4) .metrics-selection', 'Minimum');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(4) .field-selection', 'simple_column');

  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(5) .metrics-selection', 'Maximum');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(5) .field-selection', 'simple_column');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  Count(*), avg_s, Average(simple_column), Sum(simple_column), ' +
                 'Minimum(simple_column), Maximum(simple_column)');
  });
});

test('it summarizes a grouped data query with groups first', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.GROUP);

  visit('/queries/new');
  click('.output-options #grouped-data');

  click('.groups-container .add-group');
  selectChoose('.groups-container .field-selection-container:eq(0) .field-selection', 'complex_map_column.*');
  fillIn('.groups-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'foo');
  triggerEvent('.groups-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'blur');

  click('.groups-container .add-group');
  selectChoose('.groups-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.groups-container .field-selection-container:eq(1) .field-name input', 'bar');

  click('.output-container .metrics-container .add-metric');
  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(0) .metrics-selection', 'Count');
  selectChoose('.output-container .metrics-container .metrics-selection:eq(1)', 'Average');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.output-container .metrics-container .field-selection-container:eq(1) .field-name input', 'avg_bar');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  complex_map_column.foo, bar, Count(*), avg_bar');
  });
});

test('it summarizes a quantile distribution query', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.DISTRIBUTION);

  visit('/queries/new');
  click('.output-options #distribution');

  selectChoose('.output-container .field-selection-container .field-selection', 'complex_map_column.*');
  fillIn('.output-container .field-selection-container .field-selection .column-subfield input', 'foo');
  triggerEvent('.output-container .field-selection-container .field-selection .column-subfield input', 'blur');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  Quantile ON complex_map_column.foo');
  });
});

test('it summarizes a frequency distribution query', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.DISTRIBUTION);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #frequency');

  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  Frequency ON simple_column');
  });
});

test('it summarizes a cumulative frequency distribution query', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.DISTRIBUTION);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #cumulative');

  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  Cumulative Frequency ON simple_column');
  });
});

test('it summarizes a top k query', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.TOP_K);

  visit('/queries/new');
  click('.output-options #top-k');

  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  TOP 1 OF (simple_column)');
  });
});

test('it summarizes a top k query with multiple fields', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.TOP_K);

  visit('/queries/new');
  click('.output-options #top-k');

  click('.output-container .add-field');
  selectChoose('.output-container .field-selection-container:eq(0) .field-selection', 'simple_column');
  selectChoose('.output-container .field-selection-container:eq(1) .field-selection', 'complex_map_column.*');
  fillIn('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'foo');
  triggerEvent('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'blur');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  TOP 1 OF (simple_column, complex_map_column.foo)');
  });
});

test('it summarizes a top k query with custom k and threshold', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.TOP_K);

  visit('/queries/new');
  click('.output-options #top-k');

  click('.output-container .add-field');
  selectChoose('.output-container .field-selection-container:eq(0) .field-selection', 'simple_column');
  selectChoose('.output-container .field-selection-container:eq(1) .field-selection', 'complex_map_column.*');
  fillIn('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'foo');
  triggerEvent('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'blur');

  fillIn('.output-container .top-k-size input', '15');
  fillIn('.output-container .top-k-min-count input', '1500');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  TOP 15 OF (simple_column, complex_map_column.foo) HAVING Count >= 1500');
  });
});

test('it summarizes a top k query with custom k, threshold and name', function(assert) {
  assert.expect(2);
  server = mockAPI(COLUMNS.BASIC);
  this.mockStompCLient.mockAPI(RESULTS.TOP_K);

  visit('/queries/new');
  click('.output-options #top-k');

  click('.output-container .add-field');
  selectChoose('.output-container .field-selection-container:eq(0) .field-selection', 'simple_column');
  selectChoose('.output-container .field-selection-container:eq(1) .field-selection', 'complex_map_column.*');
  fillIn('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'foo');
  triggerEvent('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'blur');

  fillIn('.output-container .top-k-size input', '15');
  fillIn('.output-container .top-k-min-count input', '1500');
  fillIn('.output-container .top-k-display-name input', 'cnt');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description .filter-summary-text').text().trim(), 'Filters:  None');
    assert.equal(find('.query-description .fields-summary-text').text().trim(),
                 'Fields:  TOP 15 OF (simple_column, complex_map_column.foo) HAVING cnt >= 1500');
  });
});

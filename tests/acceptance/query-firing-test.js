/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { visit, click, fillIn, triggerEvent, currentRouteName } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import $ from 'jquery';

module('Acceptance | query firing', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('query firing and redirecting to result', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('queries/new');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
  });

  test('query firing and result accessible through historical queries', async function(assert) {
    let data;

    assert.expect(6);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);

    await visit('queries/new');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    data = $('pre').text();
    await visit('queries');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 1);
    assert.notEqual($('.queries-table .query-date-entry').text().trim(), '--');
    assert.equal($('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
    await click('.queries-table .query-results-entry');
    await click('.result-date-entry');
    assert.equal(currentRouteName(), 'result');
    assert.equal($('pre').text(), data);
  });

  test('query firing and redirecting to error', async function(assert) {
    assert.expect(1);
    this.mockedAPI.fail(COLUMNS.BASIC);
    await visit('queries/new');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'errored');
  });

  test('creating, deleting query filters and raw data projections and saving', async function(assert) {
    assert.expect(6);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    await click('.filter-container button[data-delete=\'rule\']');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('simple_column').trigger('change');
    await fillIn('.filter-container .rule-value-container input', 'foo,bar');
    await click('.output-container .raw-sub-options #select');
    await click('.output-nested-container .projections-container .add-projection');
    // Deletes everything
    await click('.output-container .raw-sub-options #all');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
    await click('.save-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal($('.filter-container .rule-filter-container select').val(), 'simple_column');
    assert.equal($('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal($('.filter-container .rule-value-container input').val(), 'foo,bar');
    assert.equal($('.projections-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    // Test that the projection name was autofilled
    assert.equal($('.projections-container .field-name input').val(), 'simple_column');
    // Size field shown
    assert.equal($('.aggregation-size').length, 1);
  });

  test('creating a query, adding filters and raw data projections, and save on submit', async function(assert) {
    assert.expect(7);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('simple_column').trigger('change');
    await fillIn('.filter-container .rule-value-container input', 'foo,bar');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'complex_map_column.*');
    await fillIn('.projections-container .field-selection-container .field-selection .column-subfield input', 'foo');
    await triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal($('.filter-container .rule-filter-container select').val(), 'simple_column');
    assert.equal($('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal($('.filter-container .rule-value-container input').val(), 'foo,bar');
    assert.equal($('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal($('.projections-container .field-selection-container .column-subfield input').val(), 'foo');
    // Test that the projection name was autofilled
    assert.equal($('.projections-container .field-name input').val(), 'complex_map_column.foo');
    // Size field shown
    assert.equal($('.aggregation-size').length, 1);
  });

  test('creating a query with a filter subfield column filled', async function(assert) {
    assert.expect(4);
    this.mockedAPI.mock([RESULTS.RAW], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('complex_map_column.*').trigger('change');
    await fillIn('.filter-container .rule-subfield-container input', 'foo');
    await fillIn('.filter-container .rule-value-container input', 'bar');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal($('.filter-container .rule-filter-container select').val(), 'complex_map_column.*');
    assert.equal($('.filter-container .rule-subfield-container input').val(), 'foo');
    assert.equal($('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal($('.filter-container .rule-value-container input').val(), 'bar');
  });

  test('creating a query with a filter subfield column not filled', async function(assert) {
    assert.expect(4);
    this.mockedAPI.mock([RESULTS.RAW], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('complex_map_column.*').trigger('change');
    await fillIn('.filter-container .rule-value-container input', 'bar');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal($('.filter-container .rule-filter-container select').val(), 'complex_map_column.*');
    assert.equal($('.filter-container .rule-subfield-container input').val(), '');
    assert.equal($('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal($('.filter-container .rule-value-container input').val(), 'bar');
  });

  test('creating a query, adding count distinct output fields, and save on submit', async function(assert) {
    assert.expect(5);
    this.mockedAPI.mock([RESULTS.COUNT_DISTINCT], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #count-distinct');
    await click('.output-container .fields-selection-container .add-field');
    await selectChoose($('.output-container .field-selection-container .field-selection')[0], 'simple_column');
    await selectChoose($('.output-container .field-selection-container .field-selection')[1], 'complex_map_column');
    await fillIn('.output-container .count-distinct-display-name input', 'cnt');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal($('.output-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .field-selection-container:eq(1) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'complex_map_column');
    assert.equal($('.output-container .count-distinct-display-name input').val(), 'cnt');
    // No names for fields for count distinct
    assert.equal($('.output-container .field-selection-container .field-name').length, 0);
    // No size field shown
    assert.equal($('.aggregation-size').length, 0);
  });

  test('creating a query, adding groups and metrics for grouped data output fields, and save on submit', async function(assert) {
    assert.expect(11);
    this.mockedAPI.mock([RESULTS.GROUP], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await click('.output-container .groups-container .add-group');
    await selectChoose($('.output-container .groups-container .field-selection-container .field-selection')[0], 'complex_map_column');
    await selectChoose($('.output-container .groups-container .field-selection-container .field-selection')[1], 'simple_column');
    await fillIn($('.output-container .groups-container .field-selection-container:eq(1) .field-name input')[0], 'bar');

    await click('.output-container .metrics-container .add-metric');
    await click('.output-container .metrics-container .add-metric');
    await selectChoose($('.output-container .metrics-container .field-selection-container .metrics-selection')[0], 'Count');
    await selectChoose($('.output-container .metrics-container .field-selection-container .metrics-selection')[1], 'Average');
    await selectChoose($('.output-container .metrics-container .field-selection-container .field-selection')[0], 'simple_column');
    await fillIn($('.output-container .metrics-container .field-selection-container:eq(1) .field-name input')[0], 'avg_bar');

    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    // Name was autofilled for simple_column
    assert.equal($('.groups-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'complex_map_column');
    assert.equal($('.groups-container .field-selection-container:eq(0) .field-name input').val(), 'complex_map_column');
    assert.equal($('.groups-container .field-selection-container:eq(1) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.groups-container .field-selection-container:eq(1) .field-name input').val(), 'bar');

    // No field and name for count
    assert.equal($('.metrics-container .field-selection-container:eq(0) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Count');
    assert.equal($('.metrics-container .field-selection-container:eq(0) .field-selection').length, 0);
    assert.equal($('.metrics-container .field-selection-container:eq(0) .field-name input').val(), '');

    assert.equal($('.metrics-container .field-selection-container:eq(1) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Average');
    assert.equal($('.metrics-container .field-selection-container:eq(1) .field-selection .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.metrics-container .field-selection-container:eq(1) .field-name input').val(), 'avg_bar');

    // No size field shown
    assert.equal($('.aggregation-size').length, 0);
  });

  test('creating a distribution query, adding free-form points and saving on submit', async function(assert) {
    assert.expect(7);
    this.mockedAPI.mock([RESULTS.DISTRIBUTION], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.output-container .distribution-point-options #points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn('.output-container .distribution-type-points input', '0,0.2,1');

    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    // No names for fields for distribution
    assert.equal($('.output-container .field-selection-container .field-name').length, 0);
    // No size field shown
    assert.equal($('.aggregation-size').length, 0);
    assert.ok($('.output-options #distribution').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-type-options #quantile').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #points').parent().hasClass('checked'));
    assert.equal($('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .distribution-type-points input').val(), '0,0.2,1');
  });

  test('creating a top k query, adding a custom k, threshold and name', async function(assert) {
    assert.expect(10);
    this.mockedAPI.mock([RESULTS.TOP_K], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #top-k');
    await click('.output-container .add-field');
    await selectChoose($('.output-container .field-selection-container .field-selection')[0], 'simple_column');
    await selectChoose($('.output-container .field-selection-container .field-selection')[1], 'complex_map_column.*');
    await fillIn($('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input')[0], 'foo');
    await triggerEvent($('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input')[0], 'blur');
    await fillIn($('.output-container .field-selection-container:eq(1) .field-name input')[0], 'new_name');
    await fillIn('.output-container .top-k-size input', '20');
    await fillIn('.output-container .top-k-min-count input', '2000');
    await fillIn('.output-container .top-k-display-name input', 'cnt');

    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal($('.output-container .field-selection-container .field-name').length, 2);
    assert.equal($('.aggregation-size').length, 0);
    assert.ok($('.output-options #top-k').parent().hasClass('checked'));
    assert.equal($('.output-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .field-selection-container:eq(1) .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal($('.output-container .field-selection-container:eq(1) .column-subfield input').val(), 'foo');
    assert.equal($('.output-container .field-selection-container:eq(1) .field-name input').val(), 'new_name');
    assert.equal($('.output-container .top-k-size input').val(), '20');
    assert.equal($('.output-container .top-k-min-count input').val(), '2000');
    assert.equal($('.output-container .top-k-display-name input').val(), 'cnt');
  });

  test('creating a window query', async function(assert) {
    assert.expect(7);
    this.mockedAPI.mock([RESULTS.RAW], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.window-input .add-button');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal($('.window-input .ember-radio-button').length, 4);
    assert.ok($('.window-input #time-based').parent().hasClass('checked'));

    await click('.window-input #record-based');
    assert.equal($('.window-input .ember-radio-button').length, 2);
    assert.ok($('.window-input #record-based').parent().hasClass('checked'));

    await click('.window-input #time-based');
    assert.equal($('.window-input .ember-radio-button').length, 4);
    assert.ok($('.window-input #time-based').parent().hasClass('checked'));

    await click('.window-input .remove-button');
    assert.equal($('.window-input .add-button').length, 1);
  });
});

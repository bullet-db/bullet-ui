/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { visit, click, fillIn, triggerEvent, currentRouteName, find, findAll } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { findIn, findAllIn } from '../helpers/find-helpers';

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
    data = find('pre').textContent;
    await visit('queries');
    assert.equal(findAll('.queries-table .query-name-entry .query-description').length, 1);
    assert.notEqual(find('.queries-table .query-date-entry').textContent.trim(), '--');
    assert.equal(find('.queries-table .query-results-entry .length-entry').textContent.trim(), '1 Results');
    await click('.queries-table .query-results-entry');
    await click('.result-date-entry');
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('pre').textContent, data);
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
    find('.filter-container .rule-filter-container select').value = 'simple_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
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
    assert.equal(find('.filter-container .rule-filter-container select').value, 'simple_column');
    assert.equal(find('.filter-container .rule-operator-container select').value, 'equal');
    assert.equal(find('.filter-container .rule-value-container input').value, 'foo,bar');
    assert.equal(find('.projections-container .column-onlyfield .ember-power-select-selected-item').textContent.trim(), 'simple_column');
    // Test that the projection name was autofilled
    assert.equal(find('.projections-container .field-name input').value, 'simple_column');
    // Size field shown
    assert.equal(findAll('.aggregation-size').length, 1);
  });

  test('creating a query, adding filters and raw data projections, and save on submit', async function(assert) {
    assert.expect(7);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'simple_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    await fillIn('.filter-container .rule-value-container input', 'foo,bar');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'complex_map_column.*');
    await fillIn('.projections-container .field-selection-container .field-selection .column-subfield input', 'foo');
    await triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal(find('.filter-container .rule-filter-container select').value, 'simple_column');
    assert.equal(find('.filter-container .rule-operator-container select').value, 'equal');
    assert.equal(find('.filter-container .rule-value-container input').value, 'foo,bar');
    assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').textContent.trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .field-selection-container .column-subfield input').value, 'foo');
    // Test that the projection name was autofilled
    assert.equal(find('.projections-container .field-name input').value, 'complex_map_column.foo');
    // Size field shown
    assert.equal(findAll('.aggregation-size').length, 1);
  });

  test('creating a query with a filter subfield column filled', async function(assert) {
    assert.expect(4);
    this.mockedAPI.mock([RESULTS.RAW], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_map_column.*';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    await fillIn('.filter-container .rule-subfield-container input', 'foo');
    await fillIn('.filter-container .rule-value-container input', 'bar');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal(find('.filter-container .rule-filter-container select').value, 'complex_map_column.*');
    assert.equal(find('.filter-container .rule-subfield-container input').value, 'foo');
    assert.equal(find('.filter-container .rule-operator-container select').value, 'equal');
    assert.equal(find('.filter-container .rule-value-container input').value, 'bar');
  });

  test('creating a query with a filter subfield column not filled', async function(assert) {
    assert.expect(4);
    this.mockedAPI.mock([RESULTS.RAW], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_map_column.*';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    await fillIn('.filter-container .rule-value-container input', 'bar');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal(find('.filter-container .rule-filter-container select').value, 'complex_map_column.*');
    assert.equal(find('.filter-container .rule-subfield-container input').value, '');
    assert.equal(find('.filter-container .rule-operator-container select').value, 'equal');
    assert.equal(find('.filter-container .rule-value-container input').value, 'bar');
  });

  test('creating a query, adding count distinct output fields, and save on submit', async function(assert) {
    assert.expect(5);
    this.mockedAPI.mock([RESULTS.COUNT_DISTINCT], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #count-distinct');
    await click('.output-container .fields-selection-container .add-field');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[0]), 'simple_column');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[1]), 'complex_map_column');
    await fillIn('.output-container .count-distinct-display-name input', 'cnt');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal(findIn('.column-onlyfield .ember-power-select-selected-item', findAll('.output-container .field-selection-container')[0]).textContent.trim(), 'simple_column');
    assert.equal(findIn('.column-onlyfield .ember-power-select-selected-item', findAll('.output-container .field-selection-container')[1]).textContent.trim(), 'complex_map_column');
    assert.equal(find('.output-container .count-distinct-display-name input').value, 'cnt');
    // No names for fields for count distinct
    assert.equal(findAll('.output-container .field-selection-container .field-name').length, 0);
    // No size field shown
    assert.equal(findAll('.aggregation-size').length, 0);
  });

  test('creating a query, adding groups and metrics for grouped data output fields, and save on submit', async function(assert) {
    assert.expect(11);
    this.mockedAPI.mock([RESULTS.GROUP], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await click('.output-container .groups-container .add-group');
    await selectChoose(findIn('.field-selection', findAll('.output-container .groups-container .field-selection-container')[0]), 'complex_map_column');
    await selectChoose(findIn('.field-selection', findAll('.output-container .groups-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.output-container .groups-container .field-selection-container')[1]), 'bar');

    await click('.output-container .metrics-container .add-metric');
    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metrics-selection', findAll('.output-container .metrics-container .field-selection-container')[0]), 'Count');
    await selectChoose(findIn('.metrics-selection', findAll('.output-container .metrics-container .field-selection-container')[1]), 'Average');
    await selectChoose(findIn('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.output-container .metrics-container .field-selection-container')[1]), 'avg_bar');

    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    // Name was autofilled for simple_column
    assert.equal(findIn('.column-onlyfield .ember-power-select-selected-item', findAll('.groups-container .field-selection-container')[0]).textContent.trim(), 'complex_map_column');
    assert.equal(findIn('.field-name input', findAll('.groups-container .field-selection-container')[0]).value, 'complex_map_column');
    assert.equal(findIn('.column-onlyfield .ember-power-select-selected-item', findAll('.groups-container .field-selection-container')[1]).textContent.trim(), 'simple_column');
    assert.equal(findIn('.field-name input', findAll('.groups-container .field-selection-container')[1]).value, 'bar');

    // No field and name for count
    assert.equal(findIn('.metrics-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[0]).textContent.trim(), 'Count');
    assert.equal(findAllIn('.field-selection', findAll('.metrics-container .field-selection-container')[0]).length, 0);
    assert.equal(findIn('.field-name input', findAll('.metrics-container .field-selection-container')[0]).value, '');

    assert.equal(findIn('.metrics-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[1]).textContent.trim(), 'Average');
    assert.equal(findIn('.field-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[1]).textContent.trim(), 'simple_column');
    assert.equal(findIn('.field-name input', findAll('.metrics-container .field-selection-container')[1]).value, 'avg_bar');

    // No size field shown
    assert.equal(findAll('.aggregation-size').length, 0);
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
    assert.equal(findAll('.output-container .field-selection-container .field-name').length, 0);
    // No size field shown
    assert.equal(findAll('.aggregation-size').length, 0);
    assert.ok(find('.output-options #distribution').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-type-options #quantile').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #points').parentElement.classList.contains('checked'));
    assert.equal(find('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').textContent.trim(), 'simple_column');
    assert.equal(find('.output-container .distribution-type-points input').value, '0,0.2,1');
  });

  test('creating a top k query, adding a custom k, threshold and name', async function(assert) {
    assert.expect(10);
    this.mockedAPI.mock([RESULTS.TOP_K], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #top-k');
    await click('.output-container .add-field');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[0]), 'simple_column');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[1]), 'complex_map_column.*');
    await fillIn(findIn('.field-selection .column-subfield input', findAll('.output-container .field-selection-container')[1]), 'foo');
    await triggerEvent(findIn('.field-selection .column-subfield input', findAll('.output-container .field-selection-container')[1]), 'blur');
    await fillIn(findIn('.field-name input', findAll('.output-container .field-selection-container')[1]), 'new_name');
    await fillIn('.output-container .top-k-size input', '20');
    await fillIn('.output-container .top-k-min-count input', '2000');
    await fillIn('.output-container .top-k-display-name input', 'cnt');

    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal(findAll('.output-container .field-selection-container .field-name').length, 2);
    assert.equal(findAll('.aggregation-size').length, 0);
    assert.ok(find('.output-options #top-k').parentElement.classList.contains('checked'));
    assert.equal(findIn('.column-onlyfield .ember-power-select-selected-item', findAll('.output-container .field-selection-container')[0]).textContent.trim(), 'simple_column');
    assert.equal(findIn('.column-mainfield .ember-power-select-selected-item', findAll('.output-container .field-selection-container')[1]).textContent.trim(), 'complex_map_column.*');
    assert.equal(findIn('.column-subfield input', findAll('.output-container .field-selection-container')[1]).value, 'foo');
    assert.equal(findIn('.field-name input', findAll('.output-container .field-selection-container')[1]).value, 'new_name');
    assert.equal(find('.output-container .top-k-size input').value, '20');
    assert.equal(find('.output-container .top-k-min-count input').value, '2000');
    assert.equal(find('.output-container .top-k-display-name input').value, 'cnt');
  });

  test('creating a windowed query', async function(assert) {
    assert.expect(7);
    this.mockedAPI.mock([RESULTS.RAW], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.window-input .add-button');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry');
    assert.equal(findAll('.window-input .ember-radio-button').length, 4);
    assert.ok(find('.window-input #time-based').parentElement.classList.contains('checked'));

    await click('.window-input #record-based');
    assert.equal(findAll('.window-input .ember-radio-button').length, 2);
    assert.ok(find('.window-input #record-based').parentElement.classList.contains('checked'));

    await click('.window-input #time-based');
    assert.equal(findAll('.window-input .ember-radio-button').length, 4);
    assert.ok(find('.window-input #time-based').parentElement.classList.contains('checked'));

    await click('.window-input .delete-button');
    assert.equal(findAll('.window-input .add-button').length, 1);
  });
});

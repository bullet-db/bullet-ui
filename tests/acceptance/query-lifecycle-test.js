/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { visit, click, fillIn, triggerEvent, currentURL, find, findAll } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { findWithContext, findAllWithContext } from '../helpers/find-helpers';

module('Acceptance | query lifecycle', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('creating a query and finding it again', async function(assert) {
    assert.expect(1);

    await visit('/queries/new');
    let createdQuery = currentURL();
    await visit('queries');
    await click('.queries-table .query-name-entry .query-description');
    assert.equal(currentURL(), createdQuery);
  });

  test('creating a query and deleting it', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await visit('queries');
    assert.equal(findAll('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .delete-icon');
    assert.equal(findAll('.query-description').length, 0);
  });

  test('creating a query and copying it', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await visit('queries');
    assert.equal(findAll('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal(findAll('.query-description').length, 2);
  });

  test('creating an invalid query and failing to copy it', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await visit('queries');
    assert.equal(findAll('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal(findAll('.query-description').length, 1);
  });

  test('creating multiple queries and deleting them', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await visit('/queries/new');
    await visit('queries');
    assert.equal(findAll('.query-description').length, 2);
    await triggerEvent(findAll('.queries-table .query-name-entry')[0], 'mouseover');
    await click(findWithContext('.query-name-actions .delete-icon', findAll('.queries-table .query-name-entry')[0]));
    assert.equal(findAll('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .delete-icon');
    assert.equal(findAll('.query-description').length, 0);
  });

  test('creating multiple queries and copying them', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await visit('/queries/new');
    await visit('queries');
    assert.equal(findAll('.query-description').length, 2);
    await triggerEvent(findAll('.queries-table .query-name-entry')[0], 'mouseover');
    await click(findWithContext('.query-name-actions .copy-icon', findAll('.queries-table .query-name-entry')[0]));
    assert.equal(findAll('.query-description').length, 3);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click(findWithContext('.query-name-actions .copy-icon', findAll('.queries-table .query-name-entry')[1]));
    assert.equal(findAll('.query-description').length, 4);
  });

  test('adding a filter with a simple column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'simple_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    assert.equal(find('.filter-container .rule-filter-container select').value, 'simple_column');
    assert.equal(findAll('.filter-container .rule-subfield-container input').length, 0);
    assert.equal(find('.filter-container .rule-operator-container select').value, 'equal');
  });

  test('adding a complex map field column filter with a subfield column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_map_column.*';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    assert.equal(find('.filter-container .rule-filter-container select').value, 'complex_map_column.*');
    assert.equal(find('.filter-container .rule-operator-container select').value, 'equal');
    assert.equal(findAll('.filter-container .rule-subfield-container input').length, 1);
  });

  test('adding a complex map field column filter without a subfield column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_map_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    assert.equal(find('.filter-container .rule-filter-container select').value, 'complex_map_column');
    assert.equal(find('.filter-container .rule-operator-container select').value, 'is_null');
    assert.equal(findAll('.filter-container .rule-subfield-container input').length, 0);
  });

  test('adding and removing filter rules', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    assert.equal(findAll('.filter-container .rule-container').length, 0);
    await click('.filter-container button[data-add=\'rule\']');
    assert.equal(findAll('.filter-container .rule-container').length, 1);
    await click('.filter-container .rules-list button[data-delete=\'rule\']');
    assert.equal(findAll('.filter-container .rule-container').length, 0);
  });

  test('raw data output with all columns is selected by default', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    assert.ok(find('.output-options #raw').parentElement.classList.contains('checked'));
    assert.equal(findAll('.output-container .projections-container .add-projection').length, 0);
    assert.equal(findAll('.projections-container').length, 0);
  });

  test('adding and removing raw data output projections', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await selectChoose(findWithContext('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'simple_column');
    await fillIn(findWithContext('.field-name input', findAll('.projections-container .field-selection-container')[0]), 'new_name');
    assert.equal(findAll('.projections-container .column-onlyfield').length, 2);
    await click(findWithContext('.delete-button', findAll('.projections-container .field-selection-container')[1]));
    assert.equal(findAll('.projections-container .field-selection-container').length, 1);
    // The last one cannot be removed
    assert.equal(findAll('.projections-container .field-selection-container .delete-button').length, 0);
  });

  test('filling out projection name even when there are errors', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
    assert.equal(findAll('.projections-container .column-onlyfield').length, 1);
    await fillIn('.options-container .aggregation-size input', '');
    await click('.save-button');
    assert.equal(find('.projections-container .field-name input').value, 'simple_column');
    assert.equal(findAll('.validation-container .simple-alert').length, 1);
  });

  test('adding a projection with a subfield column', async function(assert) {
    assert.expect(5);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'complex_map_column.*');
    await fillIn('.projections-container .field-selection-container .field-name input', 'new_name');
    assert.equal(findAll('.projections-container .field-selection .column-mainfield').length, 1);
    await triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
    assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').textContent.trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .field-selection-container .column-subfield input').value, '');
    await fillIn('.projections-container .field-selection-container .field-selection .column-subfield input', 'foo');
    await triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
    assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').textContent.trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .field-selection-container .column-subfield input').value, 'foo');
  });

  test('switching to another output data type wipes selected columns', async function(assert) {
    assert.expect(6);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose(findWithContext('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'complex_map_column.*');
    await fillIn(
      findWithContext('.field-selection .column-subfield input', findAll('.projections-container .field-selection-container')[0]),
      'foo'
    );
    await triggerEvent(
      findWithContext('.field-selection .column-subfield input', findAll('.projections-container .field-selection-container')[0]),
      'blur'
    );
    await fillIn(findWithContext('.field-name input', findAll('.projections-container .field-selection-container')[0]), 'new_name');

    await click('.output-container .projections-container .add-projection');
    await selectChoose(findWithContext('.field-selection', findAll('.projections-container .field-selection-container')[1]), 'simple_column');
    await click('.save-button');
    assert.equal(findAll('.projections-container .field-selection-container').length, 2);
    assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').textContent.trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .field-selection-container .column-subfield input').value, 'foo');
    assert.equal(find('.projections-container .field-selection-container .field-name input').value, 'new_name');
    // This means that save was also successful
    assert.equal(findWithContext('.field-name input', findAll('.projections-container .field-selection-container')[1]).value, 'simple_column');
    await click('.output-options #count-distinct');
    await click('.output-options #raw');
    await click('.output-container .raw-sub-options #select');
    assert.equal(findAll('.projections-container .field-selection-container').length, 1);
  });

  test('aggregation size is only visible when selecting the raw output option', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    assert.ok(find('.output-options #raw').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .raw-sub-options #all').parentElement.classList.contains('checked'));
    assert.equal(findAll('.aggregation-size input').length, 1);
    await click('.output-options #grouped-data');
    assert.ok(find('.output-options #grouped-data').parentElement.classList.contains('checked'));
    assert.equal(findAll('.aggregation-size input').length, 0);
    await click('.output-options #count-distinct');
    assert.ok(find('.output-options #count-distinct').parentElement.classList.contains('checked'));
    assert.equal(findAll('.aggregation-size input').length, 0);
    await click('.output-options #distribution');
    assert.ok(find('.output-options #distribution').parentElement.classList.contains('checked'));
    assert.equal(findAll('.aggregation-size input').length, 0);
    await click('.output-options #top-k');
    assert.ok(find('.output-options #top-k').parentElement.classList.contains('checked'));
    assert.equal(findAll('.aggregation-size input').length, 0);
  });

  test('copying a full query with filters, raw data output with projections and a name works', async function(assert) {
    assert.expect(10);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_list_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    await click('.output-container .raw-sub-options #select');
    await selectChoose(findWithContext('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'complex_map_column.*');
    await fillIn(
      findWithContext('.field-selection .column-subfield input', findAll('.projections-container .field-selection-container')[0]),
      'foo'
    );
    await triggerEvent(
      findWithContext('.field-selection .column-subfield input', findAll('.projections-container .field-selection-container')[0]),
      'blur'
    );
    await fillIn(findWithContext('.field-name input', findAll('.projections-container .field-selection-container')[0]), 'new_name');

    await click('.output-container .projections-container .add-projection');
    await selectChoose(findWithContext('.field-selection', findAll('.projections-container .field-selection-container')[1]), 'simple_column');

    await fillIn('.options-container .aggregation-size input', '40');
    await click('.submit-button');
    await visit('queries');
    assert.equal(find('.query-description').textContent.trim(), 'test query');
    assert.equal(find('.queries-table .query-results-entry .length-entry').textContent.trim(), '1 Results');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal(findAll('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(findAll('.queries-table .query-results-entry .length-entry')[0].textContent.trim(), '1 Results');
    assert.equal(findAll('.queries-table .query-results-entry')[1].textContent.trim(), '--');
    assert.equal(findAll('.queries-table .query-name-entry .query-description')[1].textContent.trim(), 'test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.equal(find('.filter-container .rule-filter-container select').value, 'complex_list_column');
    assert.equal(findWithContext('.field-name input', findAll('.projections-container .field-selection-container')[0]).value, 'new_name');
    assert.equal(findWithContext('.field-name input', findAll('.projections-container .field-selection-container')[1]).value, 'simple_column');
    assert.equal(find('.options-container .aggregation-size input').value, '40');
  });

  test('copying a full query with filters, grouped data output with groups and fields works', async function(assert) {
    assert.expect(15);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_list_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await click('.output-container .groups-container .add-group');
    await selectChoose(findWithContext('.field-selection', findAll('.output-container .groups-container .field-selection-container')[0]), 'complex_map_column');
    await selectChoose(findWithContext('.field-selection', findAll('.output-container .groups-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findWithContext('.field-name input', findAll('.output-container .groups-container .field-selection-container')[1]), 'bar');

    await click('.output-container .metrics-container .add-metric');
    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findWithContext('.metrics-selection', findAll('.output-container .metrics-container .field-selection-container')[0]), 'Count');
    await selectChoose(findAll('.output-container .metrics-container .metrics-selection')[1], 'Average');
    await selectChoose(findWithContext('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findWithContext('.field-name input', findAll('.output-container .metrics-container .field-selection-container')[1]), 'avg_bar');

    await click('.save-button');
    await visit('queries');
    assert.equal(find('.query-description').textContent.trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal(findAll('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(findAll('.queries-table .query-results-entry')[1].textContent.trim(), '--');
    assert.equal(findAll('.queries-table .query-name-entry .query-description')[1].textContent.trim(), 'test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.equal(find('.filter-container .rule-filter-container select').value, 'complex_list_column');
    assert.equal(findWithContext('.column-onlyfield .ember-power-select-selected-item', findAll('.groups-container .field-selection-container')[0]).textContent.trim(), 'complex_map_column');
    assert.equal(findWithContext('.field-name input', findAll('.groups-container .field-selection-container')[0]).value, 'complex_map_column');
    assert.equal(findWithContext('.column-onlyfield .ember-power-select-selected-item', findAll('.groups-container .field-selection-container')[1]).textContent.trim(), 'simple_column');
    assert.equal(findWithContext('.field-name input', findAll('.groups-container .field-selection-container')[1]).value, 'bar');
    assert.equal(findWithContext('.metrics-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[0]).textContent.trim(), 'Count');
    assert.equal(findAllWithContext('.field-selection', findAll('.metrics-container .field-selection-container')[0]).length, 0);
    assert.equal(findWithContext('.field-name input', findAll('.metrics-container .field-selection-container')[0]).value, '');
    assert.equal(findWithContext('.metrics-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[1]).textContent.trim(), 'Average');
    assert.equal(findWithContext('.field-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[1]).textContent.trim(), 'simple_column');
    assert.equal(findWithContext('.field-name input', findAll('.metrics-container .field-selection-container')[1]).value, 'avg_bar');
  });

  test('distribution output selects quantiles and number of points by default', async function(assert) {
    assert.expect(6);

    await visit('/queries/new');
    await click('.output-options #distribution');
    assert.ok(find('.output-options #distribution').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-type-options #quantile').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #number-points').parentElement.classList.contains('checked'));
    assert.equal(findAll('.output-container .fields-selection-container .add-field').length, 0);
    assert.equal(findAll('.fields-selection-container .field-selection-container').length, 1);
    assert.equal(findAll('.fields-selection-container .field-selection-container .delete-button').length, 0);
  });

  test('copying a distribution query with number of points works', async function(assert) {
    assert.expect(9);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #distribution');
    await click('.distribution-type-options #cumulative');
    await click('.output-container .distribution-point-options #number-points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn('.output-container .distribution-type-number-of-points input', '15');

    await click('.save-button');
    await visit('queries');
    assert.equal(find('.query-description').textContent.trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal(findAll('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(findAll('.queries-table .query-results-entry')[1].textContent.trim(), '--');
    assert.equal(findAll('.queries-table .query-name-entry .query-description')[1].textContent.trim(), 'test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.ok(find('.output-options #distribution').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-type-options #cumulative').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #number-points').parentElement.classList.contains('checked'));
    assert.equal(find('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').textContent.trim(), 'simple_column');
    assert.equal(find('.output-container .distribution-type-number-of-points input').value, '15');
  });

  test('copying a distribution query with generated points works', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #distribution');
    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #generate-points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '1.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '2.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '0.5');

    await click('.save-button');
    await visit('queries');
    assert.equal(find('.query-description').textContent.trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal(findAll('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(findAll('.queries-table .query-results-entry')[1].textContent.trim(), '--');
    assert.equal(findAll('.queries-table .query-name-entry .query-description')[1].textContent.trim(), 'test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.ok(find('.output-options #distribution').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-type-options #frequency').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #generate-points').parentElement.classList.contains('checked'));
    assert.equal(find('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').textContent.trim(), 'simple_column');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[0].value, '1.5');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[1].value, '2.5');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[2].value, '0.5');
  });

  test('copying a distribution query with points works', async function(assert) {
    assert.expect(9);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #distribution');
    await click('.output-container .distribution-point-options #points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn('.output-container .distribution-type-points input', '0,0.2,1');

    await click('.save-button');
    await visit('queries');
    assert.equal(find('.query-description').textContent.trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal(findAll('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(findAll('.queries-table .query-results-entry')[1].textContent.trim(), '--');
    assert.equal(findAll('.queries-table .query-name-entry .query-description')[1].textContent.trim(), 'test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.ok(find('.output-options #distribution').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-type-options #quantile').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #points').parentElement.classList.contains('checked'));
    assert.equal(find('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').textContent.trim(), 'simple_column');
    assert.equal(find('.output-container .distribution-type-points input').value, '0,0.2,1');
  });

  test('copying a top k query works', async function(assert) {
    assert.expect(12);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #top-k');

    await click('.output-container .add-field');
    await selectChoose(findWithContext('.field-selection', findAll('.output-container .field-selection-container')[0]), 'simple_column');
    await selectChoose(findWithContext('.field-selection', findAll('.output-container .field-selection-container')[1]), 'complex_map_column.*');
    await fillIn(findWithContext('.field-selection .column-subfield input', findAll('.output-container .field-selection-container')[1]), 'foo');
    await triggerEvent(findWithContext('.field-selection .column-subfield input', findAll('.output-container .field-selection-container')[1]), 'blur');
    await fillIn(findWithContext('.field-name input', findAll('.output-container .field-selection-container')[1]), 'new_name');

    await fillIn('.output-container .top-k-size input', '15');
    await fillIn('.output-container .top-k-min-count input', '1500');
    await fillIn('.output-container .top-k-display-name input', 'cnt');

    await click('.save-button');
    await visit('queries');
    assert.equal(find('.query-description').textContent.trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal(findAll('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(findAll('.queries-table .query-results-entry')[1].textContent.trim(), '--');
    assert.equal(findAll('.queries-table .query-name-entry .query-description')[1].textContent.trim(), 'test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.ok(find('.output-options #top-k').parentElement.classList.contains('checked'));
    assert.equal(findWithContext('.column-onlyfield .ember-power-select-selected-item', findAll('.output-container .field-selection-container')[0]).textContent.trim(), 'simple_column');
    assert.equal(findWithContext('.column-mainfield .ember-power-select-selected-item', findAll('.output-container .field-selection-container')[1]).textContent.trim(), 'complex_map_column.*');
    assert.equal(findWithContext('.column-subfield input', findAll('.output-container .field-selection-container')[1]).value, 'foo');
    assert.equal(findWithContext('.field-name input', findAll('.output-container .field-selection-container')[1]).value, 'new_name');
    assert.equal(find('.output-container .top-k-size input').value, '15');
    assert.equal(find('.output-container .top-k-min-count input').value, '1500');
    assert.equal(find('.output-container .top-k-display-name input').value, 'cnt');
  });

  test('distribution queries are sticky when switching to and from frequency to cumulative frequency', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await click('.output-options #distribution');

    await click('.distribution-type-options #cumulative');
    await click('.output-container .distribution-point-options #number-points');
    await fillIn('.output-container .distribution-type-number-of-points input', '15');
    await click('.distribution-type-options #frequency');
    assert.ok(find('.output-container .distribution-type-options #frequency').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #number-points').parentElement.classList.contains('checked'));
    assert.equal(find('.output-container .distribution-type-number-of-points input').value, '15');

    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #points');
    await fillIn('.output-container .distribution-type-points input', '1,4,51,5');
    await click('.distribution-type-options #cumulative');
    assert.ok(find('.output-container .distribution-type-options #cumulative').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #points').parentElement.classList.contains('checked'));
    assert.equal(find('.output-container .distribution-type-points input').value, '1,4,51,5');

    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #generate-points');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '1.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '2.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '0.5');
    await click('.distribution-type-options #cumulative');
    assert.ok(find('.output-container .distribution-type-options #cumulative').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #generate-points').parentElement.classList.contains('checked'));
    assert.equal(findAll('.output-container .distribution-type-point-range input')[0].value, '1.5');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[1].value, '2.5');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[2].value, '0.5');
  });

  test('quantile query point value fields are not sticky when switching to another distribution', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await click('.output-options #distribution');

    await click('.distribution-type-options #quantile');
    await click('.output-container .distribution-point-options #number-points');
    await fillIn('.output-container .distribution-type-number-of-points input', '15');
    await click('.distribution-type-options #frequency');
    assert.ok(find('.output-container .distribution-type-options #frequency').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #number-points').parentElement.classList.contains('checked'));
    assert.equal(find('.output-container .distribution-type-number-of-points input').value, '11');

    await click('.distribution-type-options #quantile');
    await click('.output-container .distribution-point-options #points');
    await fillIn('.output-container .distribution-type-points input', '0,0.5,0.4');
    await click('.distribution-type-options #cumulative');
    assert.ok(find('.output-container .distribution-type-options #cumulative').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #points').parentElement.classList.contains('checked'));
    assert.equal(find('.output-container .distribution-type-points input').value, '');

    await click('.distribution-type-options #quantile');
    await click('.output-container .distribution-point-options #generate-points');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '0.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '0.75');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '0.5');
    await click('.distribution-type-options #cumulative');
    assert.ok(find('.output-container .distribution-type-options #cumulative').parentElement.classList.contains('checked'));
    assert.ok(find('.output-container .distribution-point-options #generate-points').parentElement.classList.contains('checked'));
    assert.equal(findAll('.output-container .distribution-type-point-range input')[0].value, '');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[1].value, '');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[2].value, '');
  });

  test('creating a valid query and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.equal(findAll('.query-name-entry').length, 1);
    assert.equal(findAll('.query-unsaved').length, 0);
  });

  test('editing a query field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.equal(findAll('.query-name-entry').length, 1);
    assert.equal(findAll('.query-unsaved').length, 0);
    await click('.queries-table .query-name-entry .query-description');
    await fillIn('.name-container input', 'test query');
    await visit('queries');
    assert.equal(findAll('.query-name-entry').length, 1);
    assert.equal(findAll('.query-unsaved').length, 1);
  });

  test('adding a projection field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.equal(findAll('.query-name-entry').length, 1);
    assert.equal(findAll('.query-unsaved').length, 0);
    await click('.queries-table .query-name-entry .query-description');
    await click('.output-container .raw-sub-options #select');
    await selectChoose(findWithContext('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'simple_column');
    await visit('queries');
    assert.equal(findAll('.query-name-entry').length, 1);
    assert.equal(findAll('.query-unsaved').length, 1);
  });

  test('adding a group field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.equal(findAll('.query-name-entry').length, 1);
    assert.equal(findAll('.query-unsaved').length, 0);
    await click('.queries-table .query-name-entry .query-description');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await selectChoose('.output-container .groups-container .field-selection-container .field-selection', 'simple_column');
    await visit('queries');
    assert.equal(findAll('.query-name-entry').length, 1);
    assert.equal(findAll('.query-unsaved').length, 1);
  });

  test('creating an invalid query and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await visit('queries');
    assert.equal(findAll('.query-name-entry').length, 1);
    assert.equal(findAll('.query-unsaved').length, 1);
  });
});

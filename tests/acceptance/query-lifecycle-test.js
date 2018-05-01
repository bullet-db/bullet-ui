/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { visit, click, fillIn, triggerEvent, currentURL } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import $ from 'jquery';

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
    assert.equal($('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .delete-icon');
    assert.equal($('.query-description').length, 0);
  });

  test('creating a query and copying it', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await visit('queries');
    assert.equal($('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal($('.query-description').length, 2);
  });

  test('creating an invalid query and failing to copy it', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await visit('queries');
    assert.equal($('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal($('.query-description').length, 1);
  });

  test('creating multiple queries and deleting them', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await visit('/queries/new');
    await visit('queries');
    assert.equal($('.query-description').length, 2);
    await triggerEvent($('.queries-table .query-name-entry:eq(0)')[0], 'mouseover');
    await click($('.queries-table .query-name-entry:eq(0) .query-name-actions .delete-icon')[0]);
    assert.equal($('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .delete-icon');
    assert.equal($('.query-description').length, 0);
  });

  test('creating multiple queries and copying them', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await visit('/queries/new');
    await visit('queries');
    assert.equal($('.query-description').length, 2);
    await triggerEvent($('.queries-table .query-name-entry:eq(0)')[0], 'mouseover');
    await click($('.queries-table .query-name-entry:eq(0) .query-name-actions .copy-icon')[0]);
    assert.equal($('.query-description').length, 3);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click($('.queries-table .query-name-entry:eq(1) .query-name-actions .copy-icon')[0]);
    assert.equal($('.query-description').length, 4);
  });

  test('adding a filter with a simple column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('simple_column').trigger('change');
    assert.equal($('.filter-container .rule-filter-container select').val(), 'simple_column');
    assert.equal($('.filter-container .rule-subfield-container input').length, 0);
    assert.equal($('.filter-container .rule-operator-container select').val(), 'equal');
  });

  test('adding a complex map field column filter with a subfield column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('complex_map_column.*').trigger('change');
    assert.equal($('.filter-container .rule-filter-container select').val(), 'complex_map_column.*');
    assert.equal($('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal($('.filter-container .rule-subfield-container input').length, 1);
  });

  test('adding a complex map field column filter without a subfield column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('complex_map_column').trigger('change');
    assert.equal($('.filter-container .rule-filter-container select').val(), 'complex_map_column');
    assert.equal($('.filter-container .rule-operator-container select').val(), 'is_null');
    assert.equal($('.filter-container .rule-subfield-container input').length, 0);
  });

  test('adding and removing filter rules', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    assert.equal($('.filter-container .rule-container').length, 0);
    await click('.filter-container button[data-add=\'rule\']');
    assert.equal($('.filter-container .rule-container').length, 1);
    await click('.filter-container .rules-list button[data-delete=\'rule\']');
    assert.equal($('.filter-container .rule-container').length, 0);
  });

  test('raw data output with all columns is selected by default', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    assert.ok($('.output-options #raw').parent().hasClass('checked'));
    assert.equal($('.output-container .projections-container .add-projection').length, 0);
    assert.equal($('.projections-container').length, 0);
  });

  test('adding and removing raw data output projections', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await selectChoose($('.projections-container .field-selection-container .field-selection')[0], 'simple_column');
    await fillIn($('.projections-container .field-selection-container:eq(0) .field-name input')[0], 'new_name');
    assert.equal($('.projections-container .column-onlyfield').length, 2);
    await click($('.projections-container .field-selection-container:eq(1) .delete-button')[0]);
    assert.equal($('.projections-container .field-selection-container').length, 1);
    // The last one cannot be removed
    assert.equal($('.projections-container .field-selection-container .delete-button').length, 0);
  });

  test('filling out projection name even when there are errors', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
    assert.equal($('.projections-container .column-onlyfield').length, 1);
    await fillIn('.options-container .aggregation-size input', '');
    await click('.save-button');
    assert.equal($('.projections-container .field-name input').val(), 'simple_column');
    assert.equal($('.validation-container .simple-alert').length, 1);
  });

  test('adding a projection with a subfield column', async function(assert) {
    assert.expect(5);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'complex_map_column.*');
    await fillIn('.projections-container .field-selection-container .field-name input', 'new_name');
    assert.equal($('.projections-container .field-selection .column-mainfield').length, 1);
    await triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
    assert.equal($('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal($('.projections-container .field-selection-container .column-subfield input').val(), '');
    await fillIn('.projections-container .field-selection-container .field-selection .column-subfield input', 'foo');
    await triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
    assert.equal($('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal($('.projections-container .field-selection-container .column-subfield input').val(), 'foo');
  });

  test('switching to another output data type wipes selected columns', async function(assert) {
    assert.expect(6);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose($('.projections-container .field-selection-container .field-selection')[0], 'complex_map_column.*');
    await fillIn(
      $('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input')[0],
      'foo'
    );
    await triggerEvent(
      $('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input')[0],
      'blur'
    );
    await fillIn($('.projections-container .field-selection-container:eq(0) .field-name input')[0], 'new_name');

    await click('.output-container .projections-container .add-projection');
    await selectChoose($('.projections-container .field-selection-container .field-selection')[1], 'simple_column');
    await click('.save-button');
    assert.equal($('.projections-container .field-selection-container').length, 2);
    assert.equal($('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal($('.projections-container .field-selection-container .column-subfield input').val(), 'foo');
    assert.equal($('.projections-container .field-selection-container .field-name input').val(), 'new_name');
    // This means that save was also successful
    assert.equal($('.projections-container .field-selection-container:eq(1) .field-name input').val(), 'simple_column');
    await click('.output-options #count-distinct');
    await click('.output-options #raw');
    await click('.output-container .raw-sub-options #select');
    assert.equal($('.projections-container .field-selection-container').length, 1);
  });

  test('aggregation size is only visible when selecting the raw output option', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    assert.ok($('.output-options #raw').parent().hasClass('checked'));
    assert.ok($('.output-container .raw-sub-options #all').parent().hasClass('checked'));
    assert.equal($('.aggregation-size input').length, 1);
    await click('.output-options #grouped-data');
    assert.ok($('.output-options #grouped-data').parent().hasClass('checked'));
    assert.equal($('.aggregation-size input').length, 0);
    await click('.output-options #count-distinct');
    assert.ok($('.output-options #count-distinct').parent().hasClass('checked'));
    assert.equal($('.aggregation-size input').length, 0);
    await click('.output-options #distribution');
    assert.ok($('.output-options #distribution').parent().hasClass('checked'));
    assert.equal($('.aggregation-size input').length, 0);
    await click('.output-options #top-k');
    assert.ok($('.output-options #top-k').parent().hasClass('checked'));
    assert.equal($('.aggregation-size input').length, 0);
  });

  test('copying a full query with filters, raw data output with projections and a name works', async function(assert) {
    assert.expect(10);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('complex_list_column').trigger('change');
    await click('.output-container .raw-sub-options #select');
    await selectChoose($('.projections-container .field-selection-container .field-selection')[0], 'complex_map_column.*');
    await fillIn(
      $('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input')[0],
      'foo'
    );
    await triggerEvent(
      $('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input')[0],
      'blur'
    );
    await fillIn($('.projections-container .field-selection-container:eq(0) .field-name input')[0], 'new_name');

    await click('.output-container .projections-container .add-projection');
    await selectChoose($('.projections-container .field-selection-container .field-selection')[1], 'simple_column');

    await fillIn('.options-container .aggregation-size input', '40');
    await click('.submit-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    assert.equal($('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.equal($('.filter-container .rule-filter-container select').val(), 'complex_list_column');
    assert.equal($('.projections-container .field-selection-container:eq(0) .field-name input').val(), 'new_name');
    assert.equal($('.projections-container .field-selection-container:eq(1) .field-name input').val(), 'simple_column');
    assert.equal($('.options-container .aggregation-size input').val(), '40');
  });

  test('copying a full query with filters, grouped data output with groups and fields works', async function(assert) {
    assert.expect(15);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.filter-container button[data-add=\'rule\']');
    $('.filter-container .rule-filter-container select').val('complex_list_column').trigger('change');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await click('.output-container .groups-container .add-group');
    await selectChoose($('.output-container .groups-container .field-selection-container .field-selection')[0], 'complex_map_column');
    await selectChoose($('.output-container .groups-container .field-selection-container .field-selection')[1], 'simple_column');
    await fillIn($('.output-container .groups-container .field-selection-container:eq(1) .field-name input')[0], 'bar');

    await click('.output-container .metrics-container .add-metric');
    await click('.output-container .metrics-container .add-metric');
    await selectChoose($('.output-container .metrics-container .field-selection-container:eq(0) .metrics-selection')[0], 'Count');
    await selectChoose($('.output-container .metrics-container .metrics-selection')[1], 'Average');
    await selectChoose($('.output-container .metrics-container .field-selection-container .field-selection')[0], 'simple_column');
    await fillIn($('.output-container .metrics-container .field-selection-container:eq(1) .field-name input')[0], 'avg_bar');

    await click('.save-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.equal($('.filter-container .rule-filter-container select').val(), 'complex_list_column');
    assert.equal($('.groups-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'complex_map_column');
    assert.equal($('.groups-container .field-selection-container:eq(0) .field-name input').val(), 'complex_map_column');
    assert.equal($('.groups-container .field-selection-container:eq(1) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.groups-container .field-selection-container:eq(1) .field-name input').val(), 'bar');
    assert.equal($('.metrics-container .field-selection-container:eq(0) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Count');
    assert.equal($('.metrics-container .field-selection-container:eq(0) .field-selection').length, 0);
    assert.equal($('.metrics-container .field-selection-container:eq(0) .field-name input').val(), '');
    assert.equal($('.metrics-container .field-selection-container:eq(1) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Average');
    assert.equal($('.metrics-container .field-selection-container:eq(1) .field-selection .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.metrics-container .field-selection-container:eq(1) .field-name input').val(), 'avg_bar');
  });

  test('distribution output selects quantiles and number of points by default', async function(assert) {
    assert.expect(6);

    await visit('/queries/new');
    await click('.output-options #distribution');
    assert.ok($('.output-options #distribution').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-type-options #quantile').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal($('.output-container .fields-selection-container .add-field').length, 0);
    assert.equal($('.fields-selection-container .field-selection-container').length, 1);
    assert.equal($('.fields-selection-container .field-selection-container .delete-button').length, 0);
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
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.ok($('.output-options #distribution').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal($('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .distribution-type-number-of-points input').val(), '15');
  });

  test('copying a distribution query with generated points works', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #distribution');
    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #generate-points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn($('.output-container .distribution-type-point-range input:eq(0)')[0], '1.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(1)')[0], '2.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(2)')[0], '0.5');

    await click('.save-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.ok($('.output-options #distribution').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-type-options #frequency').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #generate-points').parent().hasClass('checked'));
    assert.equal($('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .distribution-type-point-range input:eq(0)').val(), '1.5');
    assert.equal($('.output-container .distribution-type-point-range input:eq(1)').val(), '2.5');
    assert.equal($('.output-container .distribution-type-point-range input:eq(2)').val(), '0.5');
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
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.ok($('.output-options #distribution').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-type-options #quantile').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #points').parent().hasClass('checked'));
    assert.equal($('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .distribution-type-points input').val(), '0,0.2,1');
  });

  test('copying a top k query works', async function(assert) {
    assert.expect(12);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #top-k');

    await click('.output-container .add-field');
    await selectChoose($('.output-container .field-selection-container .field-selection')[0], 'simple_column');
    await selectChoose($('.output-container .field-selection-container .field-selection')[1], 'complex_map_column.*');
    await fillIn($('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input')[0], 'foo');
    await triggerEvent($('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input')[0], 'blur');
    await fillIn($('.output-container .field-selection-container:eq(1) .field-name input')[0], 'new_name');

    await fillIn('.output-container .top-k-size input', '15');
    await fillIn('.output-container .top-k-min-count input', '1500');
    await fillIn('.output-container .top-k-display-name input', 'cnt');

    await click('.save-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.ok($('.output-options #top-k').parent().hasClass('checked'));
    assert.equal($('.output-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .field-selection-container:eq(1) .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal($('.output-container .field-selection-container:eq(1) .column-subfield input').val(), 'foo');
    assert.equal($('.output-container .field-selection-container:eq(1) .field-name input').val(), 'new_name');
    assert.equal($('.output-container .top-k-size input').val(), '15');
    assert.equal($('.output-container .top-k-min-count input').val(), '1500');
    assert.equal($('.output-container .top-k-display-name input').val(), 'cnt');
  });

  test('distribution queries are sticky when switching to and from frequency to cumulative frequency', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await click('.output-options #distribution');

    await click('.distribution-type-options #cumulative');
    await click('.output-container .distribution-point-options #number-points');
    await fillIn('.output-container .distribution-type-number-of-points input', '15');
    await click('.distribution-type-options #frequency');
    assert.ok($('.output-container .distribution-type-options #frequency').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal($('.output-container .distribution-type-number-of-points input').val(), '15');

    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #points');
    await fillIn('.output-container .distribution-type-points input', '1,4,51,5');
    await click('.distribution-type-options #cumulative');
    assert.ok($('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #points').parent().hasClass('checked'));
    assert.equal($('.output-container .distribution-type-points input').val(), '1,4,51,5');

    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #generate-points');
    await fillIn($('.output-container .distribution-type-point-range input:eq(0)')[0], '1.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(1)')[0], '2.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(2)')[0], '0.5');
    await click('.distribution-type-options #cumulative');
    assert.ok($('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #generate-points').parent().hasClass('checked'));
    assert.equal($('.output-container .distribution-type-point-range input:eq(0)').val(), '1.5');
    assert.equal($('.output-container .distribution-type-point-range input:eq(1)').val(), '2.5');
    assert.equal($('.output-container .distribution-type-point-range input:eq(2)').val(), '0.5');
  });

  test('quantile query point value fields are not sticky when switching to another distribution', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await click('.output-options #distribution');

    await click('.distribution-type-options #quantile');
    await click('.output-container .distribution-point-options #number-points');
    await fillIn('.output-container .distribution-type-number-of-points input', '15');
    await click('.distribution-type-options #frequency');
    assert.ok($('.output-container .distribution-type-options #frequency').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal($('.output-container .distribution-type-number-of-points input').val(), '11');

    await click('.distribution-type-options #quantile');
    await click('.output-container .distribution-point-options #points');
    await fillIn('.output-container .distribution-type-points input', '0,0.5,0.4');
    await click('.distribution-type-options #cumulative');
    assert.ok($('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #points').parent().hasClass('checked'));
    assert.equal($('.output-container .distribution-type-points input').val(), '');

    await click('.distribution-type-options #quantile');
    await click('.output-container .distribution-point-options #generate-points');
    await fillIn($('.output-container .distribution-type-point-range input:eq(0)')[0], '0.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(1)')[0], '0.75');
    await fillIn($('.output-container .distribution-type-point-range input:eq(2)')[0], '0.5');
    await click('.distribution-type-options #cumulative');
    assert.ok($('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #generate-points').parent().hasClass('checked'));
    assert.equal($('.output-container .distribution-type-point-range input:eq(0)').val(), '');
    assert.equal($('.output-container .distribution-type-point-range input:eq(1)').val(), '');
    assert.equal($('.output-container .distribution-type-point-range input:eq(2)').val(), '');
  });

  test('creating a valid query and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.equal($('.query-name-entry').length, 1);
    assert.equal($('.query-unsaved').length, 0);
  });

  test('editing a query field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.equal($('.query-name-entry').length, 1);
    assert.equal($('.query-unsaved').length, 0);
    await click('.queries-table .query-name-entry .query-description');
    await fillIn('.name-container input', 'test query');
    await visit('queries');
    assert.equal($('.query-name-entry').length, 1);
    assert.equal($('.query-unsaved').length, 1);
  });

  test('adding a projection field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.equal($('.query-name-entry').length, 1);
    assert.equal($('.query-unsaved').length, 0);
    await click('.queries-table .query-name-entry .query-description');
    await click('.output-container .raw-sub-options #select');
    await selectChoose($('.projections-container .field-selection-container:eq(0) .field-selection')[0], 'simple_column');
    await visit('queries');
    assert.equal($('.query-name-entry').length, 1);
    assert.equal($('.query-unsaved').length, 1);
  });

  test('adding a group field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.equal($('.query-name-entry').length, 1);
    assert.equal($('.query-unsaved').length, 0);
    await click('.queries-table .query-name-entry .query-description');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await selectChoose('.output-container .groups-container .field-selection-container .field-selection', 'simple_column');
    await visit('queries');
    assert.equal($('.query-name-entry').length, 1);
    assert.equal($('.query-unsaved').length, 1);
  });

  test('creating an invalid query and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await visit('queries');
    assert.equal($('.query-name-entry').length, 1);
    assert.equal($('.query-unsaved').length, 1);
  });
});

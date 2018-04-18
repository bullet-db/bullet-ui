/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';

moduleForAcceptance('Acceptance | query lifecycle', {
  suppressLogging: true,

  beforeEach() {
    // Wipe out localstorage because we are creating queries here
    window.localStorage.clear();
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);
  }
});

test('creating a query and finding it again', function(assert) {
  assert.expect(1);

  let createdQuery;
  visit('/queries/new').then(() => {
    createdQuery = currentURL();
  });
  visit('queries');
  click('.queries-table .query-name-entry .query-description');
  andThen(() => {
    assert.equal(currentURL(), createdQuery);
  });
});

test('creating a query and deleting it', function(assert) {
  assert.expect(2);

  visit('/queries/new');
  visit('queries').then(() => {
    assert.equal(find('.query-description').length, 1);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .delete-icon');
  andThen(() => {
    assert.equal(find('.query-description').length, 0);
  });
});

test('creating a query and copying it', function(assert) {
  assert.expect(2);

  visit('/queries/new');
  visit('queries').then(() => {
    assert.equal(find('.query-description').length, 1);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.query-description').length, 2);
  });
});

test('creating an invalid query and failing to copy it', function(assert) {
  assert.expect(2);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  click('.output-container .projections-container .add-projection');
  visit('queries').then(() => {
    assert.equal(find('.query-description').length, 1);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.query-description').length, 1);
  });
});

test('creating multiple queries and deleting them', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  visit('/queries/new');
  visit('queries').then(() => {
    assert.equal(find('.query-description').length, 2);
  });
  triggerEvent('.queries-table .query-name-entry:eq(0)', 'mouseover');
  click('.queries-table .query-name-entry:eq(0) .query-name-actions .delete-icon').then(() => {
    assert.equal(find('.query-description').length, 1);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .delete-icon');
  andThen(() => {
    assert.equal(find('.query-description').length, 0);
  });
});

test('creating multiple queries and copying them', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  visit('/queries/new');
  visit('queries').then(() => {
    assert.equal(find('.query-description').length, 2);
  });
  triggerEvent('.queries-table .query-name-entry:eq(0)', 'mouseover');
  click('.queries-table .query-name-entry:eq(0) .query-name-actions .copy-icon').then(() => {
    assert.equal(find('.query-description').length, 3);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry:eq(1) .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.query-description').length, 4);
  });
});

test('adding a filter with a simple column', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('simple_column').trigger('change');
  });
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'simple_column');
    assert.equal(find('.filter-container .rule-subfield-container input').length, 0);
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
  });
});

test('adding a complex map field column filter with a subfield column', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_map_column.*').trigger('change');
  });
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_map_column.*');
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal(find('.filter-container .rule-subfield-container input').length, 1);
  });
});

test('adding a complex map field column filter without a subfield column', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_map_column').trigger('change');
  });
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_map_column');
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'is_null');
    assert.equal(find('.filter-container .rule-subfield-container input').length, 0);
  });
});

test('adding and removing filter rules', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  andThen(() => {
    assert.equal(find('.filter-container .rule-container').length, 0);
  });
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    assert.equal(find('.filter-container .rule-container').length, 1);
  });
  click('.filter-container .rules-list button[data-delete=\'rule\']');
  andThen(() => {
    assert.equal(find('.filter-container .rule-container').length, 0);
  });
});

test('raw data output with all columns is selected by default', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  andThen(() => {
    assert.ok(find('.output-options #raw').parent().hasClass('checked'));
    assert.equal(find('.output-container .projections-container .add-projection').length, 0);
    assert.equal(find('.projections-container').length, 0);
  });
});

test('adding and removing raw data output projections', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  click('.output-container .projections-container .add-projection');
  andThen(() => {
    selectChoose(find('.projections-container .field-selection-container .field-selection')[0], 'simple_column');
  });
  fillIn('.projections-container .field-selection-container:eq(0) .field-name input', 'new_name');
  andThen(() => {
    assert.equal(find('.projections-container .column-onlyfield').length, 2);
  });
  click('.projections-container .field-selection-container:eq(1) .delete-button');
  andThen(() => {
    assert.equal(find('.projections-container .field-selection-container').length, 1);
    // The last one cannot be removed
    assert.equal(find('.projections-container .field-selection-container .delete-button').length, 0);
  });
});

test('filling out projection name even when there are errors', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
  andThen(() => {
    assert.equal(find('.projections-container .column-onlyfield').length, 1);
  });
  fillIn('.options-container .aggregation-size input', '');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.projections-container .field-name input').val(), 'simple_column');
    assert.equal(find('.validation-container .simple-alert').length, 1);
  });
});

test('adding a projection with a subfield column', function(assert) {
  assert.expect(5);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  selectChoose('.projections-container .field-selection-container .field-selection', 'complex_map_column.*');
  fillIn('.projections-container .field-selection-container .field-name input', 'new_name');
  andThen(() => {
    assert.equal(find('.projections-container .field-selection .column-mainfield').length, 1);
  });
  triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
  andThen(() => {
    assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .field-selection-container .column-subfield input').val(), '');
  });
  fillIn('.projections-container .field-selection-container .field-selection .column-subfield input', 'foo');
  triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
  andThen(() => {
    assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .field-selection-container .column-subfield input').val(), 'foo');
  });
});

test('switching to another output data type wipes selected columns', function(assert) {
  assert.expect(6);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  andThen(() => {
    selectChoose(find('.projections-container .field-selection-container .field-selection')[0], 'complex_map_column.*');
  });
  fillIn('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'foo');
  triggerEvent('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'blur');
  fillIn('.projections-container .field-selection-container:eq(0) .field-name input', 'new_name');

  click('.output-container .projections-container .add-projection');
  andThen(() => {
    selectChoose(find('.projections-container .field-selection-container .field-selection')[1], 'simple_column');
  });
  click('.save-button');
  andThen(() => {
    assert.equal(find('.projections-container .field-selection-container').length, 2);
    assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .field-selection-container .column-subfield input').val(), 'foo');
    assert.equal(find('.projections-container .field-selection-container .field-name input').val(), 'new_name');
    // This means that save was also successful
    assert.equal(find('.projections-container .field-selection-container:eq(1) .field-name input').val(), 'simple_column');
  });
  click('.output-options #count-distinct');
  click('.output-options #raw');
  click('.output-container .raw-sub-options #select');
  andThen(() => {
    assert.equal(find('.projections-container .field-selection-container').length, 1);
  });
});

test('aggregation size is only visible when selecting the raw output option', function(assert) {
  assert.expect(11);

  visit('/queries/new');
  andThen(() => {
    assert.ok(find('.output-options #raw').parent().hasClass('checked'));
    assert.ok(find('.output-container .raw-sub-options #all').parent().hasClass('checked'));
    assert.equal(find('.aggregation-size input').length, 1);
  });
  click('.output-options #grouped-data');
  andThen(() => {
    assert.ok(find('.output-options #grouped-data').parent().hasClass('checked'));
    assert.equal(find('.aggregation-size input').length, 0);
  });
  click('.output-options #count-distinct');
  andThen(() => {
    assert.ok(find('.output-options #count-distinct').parent().hasClass('checked'));
    assert.equal(find('.aggregation-size input').length, 0);
  });
  click('.output-options #distribution');
  andThen(() => {
    assert.ok(find('.output-options #distribution').parent().hasClass('checked'));
    assert.equal(find('.aggregation-size input').length, 0);
  });
  click('.output-options #top-k');
  andThen(() => {
    assert.ok(find('.output-options #top-k').parent().hasClass('checked'));
    assert.equal(find('.aggregation-size input').length, 0);
  });
});

test('copying a full query with filters, raw data output with projections and a name works', function(assert) {
  assert.expect(10);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_list_column').trigger('change');
  });
  click('.output-container .raw-sub-options #select');
  andThen(() => {
    selectChoose(find('.projections-container .field-selection-container .field-selection')[0], 'complex_map_column.*');
  });
  fillIn('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'foo');
  triggerEvent('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'blur');
  fillIn('.projections-container .field-selection-container:eq(0) .field-name input', 'new_name');

  click('.output-container .projections-container .add-projection');
  andThen(() => {
    selectChoose(find('.projections-container .field-selection-container .field-selection')[1], 'simple_column');
  });

  fillIn('.options-container .aggregation-size input', '40');
  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
    assert.equal(find('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal(find('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
  });
  click('.queries-table .query-name-entry:eq(1)');
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_list_column');
    assert.equal(find('.projections-container .field-selection-container:eq(0) .field-name input').val(), 'new_name');
    assert.equal(find('.projections-container .field-selection-container:eq(1) .field-name input').val(), 'simple_column');
    assert.equal(find('.options-container .aggregation-size input').val(), '40');
  });
});

test('copying a full query with filters, grouped data output with groups and fields works', function(assert) {
  assert.expect(15);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_list_column').trigger('change');
  });
  click('.output-options #grouped-data');
  click('.output-container .groups-container .add-group');
  click('.output-container .groups-container .add-group');
  andThen(() => {
    selectChoose(find('.output-container .groups-container .field-selection-container .field-selection')[0], 'complex_map_column');
    selectChoose(find('.output-container .groups-container .field-selection-container .field-selection')[1], 'simple_column');
  });
  fillIn('.output-container .groups-container .field-selection-container:eq(1) .field-name input', 'bar');

  click('.output-container .metrics-container .add-metric');
  click('.output-container .metrics-container .add-metric');
  andThen(() => {
    selectChoose(find('.output-container .metrics-container .field-selection-container:eq(0) .metrics-selection')[0], 'Count');
    selectChoose(find('.output-container .metrics-container .metrics-selection')[1], 'Average');
    selectChoose(find('.output-container .metrics-container .field-selection-container .field-selection')[1], 'simple_column');
  });
  fillIn('.output-container .metrics-container .field-selection-container:eq(1) .field-name input', 'avg_bar');

  click('.save-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal(find('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
  });
  click('.queries-table .query-name-entry:eq(1)');
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_list_column');
    assert.equal(find('.groups-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'complex_map_column');
    assert.equal(find('.groups-container .field-selection-container:eq(0) .field-name input').val(), 'complex_map_column');
    assert.equal(find('.groups-container .field-selection-container:eq(1) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.groups-container .field-selection-container:eq(1) .field-name input').val(), 'bar');
    assert.equal(find('.metrics-container .field-selection-container:eq(0) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Count');
    assert.equal(find('.metrics-container .field-selection-container:eq(0) .field-selection').length, 0);
    assert.equal(find('.metrics-container .field-selection-container:eq(0) .field-name input').val(), '');
    assert.equal(find('.metrics-container .field-selection-container:eq(1) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Average');
    assert.equal(find('.metrics-container .field-selection-container:eq(1) .field-selection .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.metrics-container .field-selection-container:eq(1) .field-name input').val(), 'avg_bar');
  });
});

test('distribution output selects quantiles and number of points by default', function(assert) {
  assert.expect(6);

  visit('/queries/new');
  click('.output-options #distribution');
  andThen(() => {
    assert.ok(find('.output-options #distribution').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-type-options #quantile').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal(find('.output-container .fields-selection-container .add-field').length, 0);
    assert.equal(find('.fields-selection-container .field-selection-container').length, 1);
    assert.equal(find('.fields-selection-container .field-selection-container .delete-button').length, 0);
  });
});

test('copying a distribution query with number of points works', function(assert) {
  assert.expect(9);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.output-options #distribution');
  click('.distribution-type-options #cumulative');
  click('.output-container .distribution-point-options #number-points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-number-of-points input', '15');

  click('.save-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal(find('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
  });
  click('.queries-table .query-name-entry:eq(1)');
  andThen(() => {
    assert.ok(find('.output-options #distribution').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal(find('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.output-container .distribution-type-number-of-points input').val(), '15');
  });
});

test('copying a distribution query with generated points works', function(assert) {
  assert.expect(11);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.output-options #distribution');
  click('.distribution-type-options #frequency');
  click('.output-container .distribution-point-options #generate-points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-point-range input:eq(0)', '1.5');
  fillIn('.output-container .distribution-type-point-range input:eq(1)', '2.5');
  fillIn('.output-container .distribution-type-point-range input:eq(2)', '0.5');

  click('.save-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal(find('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
  });
  click('.queries-table .query-name-entry:eq(1)');
  andThen(() => {
    assert.ok(find('.output-options #distribution').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-type-options #frequency').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #generate-points').parent().hasClass('checked'));
    assert.equal(find('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.output-container .distribution-type-point-range input:eq(0)').val(), '1.5');
    assert.equal(find('.output-container .distribution-type-point-range input:eq(1)').val(), '2.5');
    assert.equal(find('.output-container .distribution-type-point-range input:eq(2)').val(), '0.5');
  });
});

test('copying a distribution query with points works', function(assert) {
  assert.expect(9);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.output-options #distribution');
  click('.output-container .distribution-point-options #points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-points input', '0,0.2,1');

  click('.save-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal(find('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
  });
  click('.queries-table .query-name-entry:eq(1)');
  andThen(() => {
    assert.ok(find('.output-options #distribution').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-type-options #quantile').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #points').parent().hasClass('checked'));
    assert.equal(find('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.output-container .distribution-type-points input').val(), '0,0.2,1');
  });
});

test('copying a top k query works', function(assert) {
  assert.expect(12);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.output-options #top-k');

  click('.output-container .add-field');
  andThen(() => {
    selectChoose(find('.output-container .field-selection-container .field-selection')[0], 'simple_column');
    selectChoose(find('.output-container .field-selection-container .field-selection')[1], 'complex_map_column.*');
  });
  fillIn('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'foo');
  triggerEvent('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'blur');
  fillIn('.output-container .field-selection-container:eq(1) .field-name input', 'new_name');

  fillIn('.output-container .top-k-size input', '15');
  fillIn('.output-container .top-k-min-count input', '1500');
  fillIn('.output-container .top-k-display-name input', 'cnt');

  click('.save-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .copy-icon');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal(find('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
  });
  click('.queries-table .query-name-entry:eq(1)');
  andThen(() => {
    assert.ok(find('.output-options #top-k').parent().hasClass('checked'));
    assert.equal(find('.output-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.output-container .field-selection-container:eq(1) .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal(find('.output-container .field-selection-container:eq(1) .column-subfield input').val(), 'foo');
    assert.equal(find('.output-container .field-selection-container:eq(1) .field-name input').val(), 'new_name');
    assert.equal(find('.output-container .top-k-size input').val(), '15');
    assert.equal(find('.output-container .top-k-min-count input').val(), '1500');
    assert.equal(find('.output-container .top-k-display-name input').val(), 'cnt');
  });
});

test('distribution queries are sticky when switching to and from frequency to cumulative frequency', function(assert) {
  assert.expect(11);

  visit('/queries/new');
  click('.output-options #distribution');

  click('.distribution-type-options #cumulative');
  click('.output-container .distribution-point-options #number-points');
  fillIn('.output-container .distribution-type-number-of-points input', '15');
  click('.distribution-type-options #frequency');
  andThen(() => {
    assert.ok(find('.output-container .distribution-type-options #frequency').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal(find('.output-container .distribution-type-number-of-points input').val(), '15');
  });

  click('.distribution-type-options #frequency');
  click('.output-container .distribution-point-options #points');
  fillIn('.output-container .distribution-type-points input', '1,4,51,5');
  click('.distribution-type-options #cumulative');
  andThen(() => {
    assert.ok(find('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #points').parent().hasClass('checked'));
    assert.equal(find('.output-container .distribution-type-points input').val(), '1,4,51,5');
  });

  click('.distribution-type-options #frequency');
  click('.output-container .distribution-point-options #generate-points');
  fillIn('.output-container .distribution-type-point-range input:eq(0)', '1.5');
  fillIn('.output-container .distribution-type-point-range input:eq(1)', '2.5');
  fillIn('.output-container .distribution-type-point-range input:eq(2)', '0.5');
  click('.distribution-type-options #cumulative');
  andThen(() => {
    assert.ok(find('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #generate-points').parent().hasClass('checked'));
    assert.equal(find('.output-container .distribution-type-point-range input:eq(0)').val(), '1.5');
    assert.equal(find('.output-container .distribution-type-point-range input:eq(1)').val(), '2.5');
    assert.equal(find('.output-container .distribution-type-point-range input:eq(2)').val(), '0.5');
  });
});

test('quantile query point value fields are not sticky when switching to another distribution', function(assert) {
  assert.expect(11);

  visit('/queries/new');
  click('.output-options #distribution');

  click('.distribution-type-options #quantile');
  click('.output-container .distribution-point-options #number-points');
  fillIn('.output-container .distribution-type-number-of-points input', '15');
  click('.distribution-type-options #frequency');
  andThen(() => {
    assert.ok(find('.output-container .distribution-type-options #frequency').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal(find('.output-container .distribution-type-number-of-points input').val(), '11');
  });

  click('.distribution-type-options #quantile');
  click('.output-container .distribution-point-options #points');
  fillIn('.output-container .distribution-type-points input', '0,0.5,0.4');
  click('.distribution-type-options #cumulative');
  andThen(() => {
    assert.ok(find('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #points').parent().hasClass('checked'));
    assert.equal(find('.output-container .distribution-type-points input').val(), '');
  });

  click('.distribution-type-options #quantile');
  click('.output-container .distribution-point-options #generate-points');
  fillIn('.output-container .distribution-type-point-range input:eq(0)', '0.5');
  fillIn('.output-container .distribution-type-point-range input:eq(1)', '0.75');
  fillIn('.output-container .distribution-type-point-range input:eq(2)', '0.5');
  click('.distribution-type-options #cumulative');
  andThen(() => {
    assert.ok(find('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok(find('.output-container .distribution-point-options #generate-points').parent().hasClass('checked'));
    assert.equal(find('.output-container .distribution-type-point-range input:eq(0)').val(), '');
    assert.equal(find('.output-container .distribution-type-point-range input:eq(1)').val(), '');
    assert.equal(find('.output-container .distribution-type-point-range input:eq(2)').val(), '');
  });
});

test('creating a valid query and checking if it is indicated as needing attention', function(assert) {
  assert.expect(2);

  visit('/queries/new');
  click('.save-button');
  visit('queries').then(() => {
    assert.equal(find('.query-name-entry').length, 1);
    assert.equal(find('.query-unsaved').length, 0);
  });
});

test('editing a query field and checking if it is indicated as needing attention', function(assert) {
  assert.expect(4);

  visit('/queries/new');
  click('.save-button');
  visit('queries').then(() => {
    assert.equal(find('.query-name-entry').length, 1);
    assert.equal(find('.query-unsaved').length, 0);
  });
  click('.queries-table .query-name-entry .query-description');
  fillIn('.name-container input', 'test query');
  visit('queries').then(() => {
    assert.equal(find('.query-name-entry').length, 1);
    assert.equal(find('.query-unsaved').length, 1);
  });
});

test('adding a projection field and checking if it is indicated as needing attention', function(assert) {
  assert.expect(4);

  visit('/queries/new');
  click('.save-button');
  visit('queries').then(() => {
    assert.equal(find('.query-name-entry').length, 1);
    assert.equal(find('.query-unsaved').length, 0);
  });
  click('.queries-table .query-name-entry .query-description');
  click('.output-container .raw-sub-options #select');
  andThen(() => {
    selectChoose(find('.projections-container .field-selection-container:eq(0) .field-selection')[0], 'simple_column');
  });
  visit('queries').then(() => {
    assert.equal(find('.query-name-entry').length, 1);
    assert.equal(find('.query-unsaved').length, 1);
  });
});

test('adding a group field and checking if it is indicated as needing attention', function(assert) {
  assert.expect(4);

  visit('/queries/new');
  click('.save-button');
  visit('queries').then(() => {
    assert.equal(find('.query-name-entry').length, 1);
    assert.equal(find('.query-unsaved').length, 0);
  });
  click('.queries-table .query-name-entry .query-description');
  click('.output-options #grouped-data');
  click('.output-container .groups-container .add-group');
  selectChoose('.output-container .groups-container .field-selection-container .field-selection', 'simple_column');
  visit('queries').then(() => {
    assert.equal(find('.query-name-entry').length, 1);
    assert.equal(find('.query-unsaved').length, 1);
  });
});

test('creating an invalid query and checking if it is indicated as needing attention', function(assert) {
  assert.expect(2);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  click('.output-container .projections-container .add-projection');
  visit('queries').then(() => {
    assert.equal(find('.query-name-entry').length, 1);
    assert.equal(find('.query-unsaved').length, 1);
  });
});

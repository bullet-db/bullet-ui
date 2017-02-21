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

moduleForAcceptance('Acceptance | query lifecycle', {
  beforeEach() {
    server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);
    return window.localforage.setDriver(window.localforage.LOCALSTORAGE);
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
    return window.localforage.clear();
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
    assert.ok(find('.output-container .raw-option #raw').parent().hasClass('checked'));
    assert.equal(find('.output-container .raw-sub-options .projections-container .add-projection').length, 0);
    assert.equal(find('.projections-container').length, 0);
  });
});

test('adding and removing raw data output projections', function(assert) {
  assert.expect(2);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  click('.output-container .raw-sub-options .projections-container .add-projection');
  selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.projections-container .field-selection-container .field-name input', 'new_name');
  andThen(() => {
    assert.equal(find('.projections-container .column-onlyfield').length, 1);
  });
  click('.projections-container .field-selection-container .delete-button');
  andThen(() => {
    assert.equal(find('.projections-container .fields-selection-container').length, 0);
  });
});

test('filling out projection name even when there are errors', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  click('.output-container .raw-sub-options .projections-container .add-projection');
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
  click('.output-container .raw-sub-options .projections-container .add-projection');
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
  click('.output-container .raw-sub-options .projections-container .add-projection');
  selectChoose('.projections-container .field-selection-container:eq(0) .field-selection', 'complex_map_column.*');
  fillIn('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'foo');
  triggerEvent('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'blur');
  fillIn('.projections-container .field-selection-container:eq(0) .field-name input', 'new_name');

  click('.output-container .raw-sub-options .projections-container .add-projection');
  selectChoose('.projections-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.projections-container .field-selection-container').length, 2);
    assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .field-selection-container .column-subfield input').val(), 'foo');
    assert.equal(find('.projections-container .field-selection-container .field-name input').val(), 'new_name');
    // This means that save was also successful
    assert.equal(find('.projections-container .field-selection-container:eq(1) .field-name input').val(), 'simple_column');
  });
  click('.output-container .count-distinct-option #count-distinct');
  click('.output-container .raw-option #raw');
  click('.output-container .raw-sub-options #select');
  andThen(() => {
    assert.equal(find('.projections-container .fields-selection-container').length, 0);
  });
});

test('aggregation size is only visible when selecting the raw output option', function(assert) {
  assert.expect(7);

  visit('/queries/new');
  andThen(() => {
    assert.ok(find('.output-container .raw-option #raw').parent().hasClass('checked'));
    assert.ok(find('.output-container .raw-sub-options #all').parent().hasClass('checked'));
    assert.equal(find('.aggregation-size input').length, 1);
  });
  click('.output-container .group-option #grouped-data');
  andThen(() => {
    assert.ok(find('.output-container .group-option #grouped-data').parent().hasClass('checked'));
    assert.equal(find('.aggregation-size input').length, 0);
  });
  click('.output-container .count-distinct-option #count-distinct');
  andThen(() => {
    assert.ok(find('.output-container .count-distinct-option #count-distinct').parent().hasClass('checked'));
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
  click('.output-container .raw-sub-options .projections-container .add-projection');
  selectChoose('.projections-container .field-selection-container:eq(0) .field-selection', 'complex_map_column.*');
  fillIn('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'foo');
  triggerEvent('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'blur');
  fillIn('.projections-container .field-selection-container:eq(0) .field-name input', 'new_name');

  click('.output-container .raw-sub-options .projections-container .add-projection');
  selectChoose('.projections-container .field-selection-container:eq(1) .field-selection', 'simple_column');

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
  click('.output-container .group-option #grouped-data');
  click('.output-container .group-option .groups-container .add-group');
  click('.output-container .group-option .groups-container .add-group');
  selectChoose('.output-container .groups-container .field-selection-container:eq(0) .field-selection', 'complex_map_column');
  selectChoose('.output-container .groups-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.output-container .groups-container .field-selection-container:eq(1) .field-name input', 'bar');

  click('.output-container .metrics-container .add-metric');
  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(0) .metrics-selection', 'Count');
  selectChoose('.output-container .metrics-container .metrics-selection:eq(1)', 'Average');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(1) .field-selection', 'simple_column');
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
    assert.equal(find('.group-option .groups-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'complex_map_column');
    assert.equal(find('.group-option .groups-container .field-selection-container:eq(0) .field-name input').val(), 'complex_map_column');
    assert.equal(find('.group-option .groups-container .field-selection-container:eq(1) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.group-option .groups-container .field-selection-container:eq(1) .field-name input').val(), 'bar');
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(0) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Count');
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(0) .field-selection').length, 0);
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(0) .field-name input').val(), '');
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(1) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Average');
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(1) .field-selection .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(1) .field-name input').val(), 'avg_bar');
  });
});

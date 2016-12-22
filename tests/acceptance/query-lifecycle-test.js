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
    // Wipe out localstorage because we are creating queries here
    window.localStorage.clear();
    server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
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
  triggerEvent('.queries-table .query-name-entry:first', 'mouseover');
  click('.queries-table .query-name-entry:first .query-name-actions .delete-icon').then(() => {
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
  triggerEvent('.queries-table .query-name-entry:first', 'mouseover');
  click('.queries-table .query-name-entry:first .query-name-actions .copy-icon').then(() => {
    assert.equal(find('.query-description').length, 3);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry:last .query-name-actions .copy-icon');
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

test('all columns are projected by default', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  andThen(() => {
    assert.ok(find('.projections-container .projection-options #all').parent().hasClass('checked'));
    assert.equal(find('.projections-container .add-button').length, 0);
    assert.equal(find('.projection-container').length, 0);
  });
});

test('adding and removing projections', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.projections-container .projection-options #select');
  selectChoose('.projections-container .projection-field', 'simple_column');
  fillIn('.projections-container .projection-name input', 'new_name');
  andThen(() => {
    assert.equal(find('.projection-container').length, 1);
    assert.equal(find('.projections-container .projection-field .column-onlyfield').length, 1);
  });
  click('.projections-container .delete-button');
  andThen(() => {
    assert.equal(find('.projection-container').length, 0);
  });
});

test('filling out projection name even when there are errors', function(assert) {
  assert.expect(4);

  visit('/queries/new');
  click('.projections-container .projection-options #select');
  selectChoose('.projections-container .projection-field', 'simple_column');
  andThen(() => {
    assert.equal(find('.projection-container').length, 1);
    assert.equal(find('.projections-container .projection-field .column-onlyfield').length, 1);
  });
  fillIn('.options-container .aggregation-size input', '');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.projection-container .projection-name input').val(), 'simple_column');
    assert.equal(find('.validation-container .simple-alert').length, 1);
  });
});


test('adding a projection with a subfield column', function(assert) {
  assert.expect(5);

  visit('/queries/new');
  click('.projections-container .projection-options #select');
  selectChoose('.projections-container .projection-field', 'complex_map_column.*');
  fillIn('.projections-container .projection-name input', 'new_name');
  andThen(() => {
    assert.equal(find('.projections-container .projection-field .column-mainfield').length, 1);
  });
  triggerEvent('.projections-container .projection-field .column-subfield input', 'focusout');
  andThen(() => {
    assert.equal(find('.projections-container .projection-field .column-mainfield .ember-power-select').text().trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .projection-field .column-subfield input').val(), '');
  });
  fillIn('.projections-container .projection-field .column-subfield input', 'foo');
  triggerEvent('.projections-container .projection-field .column-subfield input', 'focusout');
  andThen(() => {
    assert.equal(find('.projections-container .projection-field .column-mainfield .ember-power-select').text().trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .projection-field .column-subfield input').val(), 'foo');
  });
});

test('switching to another projection type wipes selected columns', function(assert) {
  assert.expect(6);

  visit('/queries/new');
  click('.projections-container .projection-options #select');
  selectChoose('.projections-container .projection-field', 'complex_map_column.*');
  fillIn('.projections-container .projection-field .column-subfield input', 'foo');
  fillIn('.projections-container .projection-name input', 'new_name');
  triggerEvent('.projections-container .projection-field .column-subfield input', 'focusout');
  click('.projections-container .add-button');
  selectChoose('.projection-container:eq(1) .projection-field', 'simple_column');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.projection-container').length, 2);
    assert.equal(find('.projections-container .projection-field .column-mainfield .ember-power-select').text().trim(), 'complex_map_column.*');
    assert.equal(find('.projections-container .projection-field .column-subfield input').val(), 'foo');
    // This means that save was also successful
    assert.equal(find('.projection-container:eq(1) .projection-name input').val(), 'simple_column');
  });
  click('.projections-container .projection-options #count');
  click('.projections-container .projection-options #select');
  andThen(() => {
    assert.equal(find('.projection-container').length, 1);
    assert.equal(find('.projection-container .projection-name input').val(), '');
  });
});

test('selecting count records is remembered', function(assert) {
  assert.expect(1);

  visit('/queries/new');
  click('.projections-container .projection-options #count');
  click('.save-button');
  visit('queries');
  click('.queries-table .query-name-entry');
  andThen(() => {
    assert.ok(find('.projections-container .projection-options #count').parent().hasClass('checked'));
  });
});

test('copying a full query with filters, projections, aggregations and a name works', function(assert) {
  assert.expect(10);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_list_column').trigger('change');
  });
  click('.projections-container .projection-options #select');
  selectChoose('.projections-container .projection-field', 'simple_column');
  fillIn('.projections-container .projection-name input', 'new_name');
  click('.projections-container .add-button');
  selectChoose('.projections-container .projection-field:last', 'complex_list_column');
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
  click('.queries-table .query-name-entry:last');
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_list_column');
    assert.equal(find('.projections-container .projection-name:first input').val(), 'new_name');
    assert.equal(find('.projections-container .projection-name:last input').val(), 'complex_list_column');
    assert.equal(find('.options-container .aggregation-size input').val(), '40');
  });
});


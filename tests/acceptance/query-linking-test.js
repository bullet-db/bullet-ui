/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { mockAPI } from '../helpers/pretender';

let server, fragment;

moduleForAcceptance('Acceptance | query linking', {
  suppressLogging: true,

  beforeEach() {
    // Wipe out localstorage because we are creating queries here
    window.localStorage.clear();
    server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);
  },

  afterEach() {
    fragment = '';
    if (server) {
      server.shutdown();
    }
  }
});

function getFragment(link) {
  let index = link.lastIndexOf('/');
  return link.substring(index + 1);
}

test('linking a query and navigating to it', function(assert) {
  assert.expect(5);

  visit('/queries/new');
  click('.submit-button');
  visit('queries').then(() => {
    assert.equal(find('.query-description').length, 1);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').val());
    visit(`/create/${fragment}`);
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
    assert.equal(find('.queries-table .query-results-entry').last().text().trim(), '--');
  });
});

test('clicking the linking query button twice closes it', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.submit-button');
  visit('queries').then(() => {
    assert.equal(find('.query-description').length, 1);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
  });
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 0);
  });
});

test('linking an invalid query fails', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  click('.output-container .projections-container .add-projection');
  visit('queries').then(() => {
    assert.equal(find('.query-description').length, 1);
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 0);
    assert.equal(find('.query-description').length, 1);
  });
});

test('linking a full query with filters, raw data output with projections and a name works', function(assert) {
  assert.expect(11);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_list_column').trigger('change');
  });
  click('.output-container .raw-sub-options #select');
  selectChoose('.projections-container .field-selection-container:eq(0) .field-selection', 'complex_map_column.*');
  fillIn('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'foo');
  triggerEvent('.projections-container .field-selection-container:eq(0) .field-selection .column-subfield input', 'blur');
  fillIn('.projections-container .field-selection-container:eq(0) .field-name input', 'new_name');

  click('.output-container .projections-container .add-projection');
  selectChoose('.projections-container .field-selection-container:eq(1) .field-selection', 'simple_column');

  fillIn('.options-container .aggregation-size input', '40');
  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').val());
    visit(`/create/${fragment}`);
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
    // The one without any results is the newly created one
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

test('linking a full query with filters, grouped data output with groups and fields works', function(assert) {
  assert.expect(17);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_list_column').trigger('change');
  });
  click('.output-options #grouped-data');
  click('.output-container .groups-container .add-group');
  click('.output-container .groups-container .add-group');
  selectChoose('.output-container .groups-container .field-selection-container:eq(0) .field-selection', 'complex_map_column');
  selectChoose('.output-container .groups-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.output-container .groups-container .field-selection-container:eq(1) .field-name input', 'bar');

  click('.output-container .metrics-container .add-metric');
  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(0) .metrics-selection', 'Count');
  selectChoose('.output-container .metrics-container .metrics-selection:eq(1)', 'Average');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.output-container .metrics-container .field-selection-container:eq(1) .field-name input', 'avg_bar');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').val());
    visit(`/create/${fragment}`);
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
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

test('linking a distribution query with number of points works', function(assert) {
  assert.expect(11);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.output-options #distribution');
  click('.distribution-type-options #cumulative');
  click('.output-container .distribution-point-options #number-points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-number-of-points input', '15');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').val());
    visit(`/create/${fragment}`);
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
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

test('linking a distribution query with generated points works', function(assert) {
  assert.expect(13);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.output-options #distribution');
  click('.distribution-type-options #frequency');
  click('.output-container .distribution-point-options #generate-points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-point-range input:eq(0)', '1.5');
  fillIn('.output-container .distribution-type-point-range input:eq(1)', '2.5');
  fillIn('.output-container .distribution-type-point-range input:eq(2)', '0.5');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').val());
    visit(`/create/${fragment}`);
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
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

test('linking a distribution query with points works', function(assert) {
  assert.expect(11);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.output-options #distribution');
  click('.output-container .distribution-point-options #points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-points input', '0,0.2,1');

  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').val());
    visit(`/create/${fragment}`);
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
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

test('linking a top k query works', function(assert) {
  assert.expect(14);

  visit('/queries/new');
  fillIn('.name-container input', 'test query');
  click('.output-options #top-k');

  click('.output-container .add-field');
  selectChoose('.output-container .field-selection-container:eq(0) .field-selection', 'simple_column');
  selectChoose('.output-container .field-selection-container:eq(1) .field-selection', 'complex_map_column.*');
  fillIn('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'foo');
  triggerEvent('.output-container .field-selection-container:eq(1) .field-selection .column-subfield input', 'blur');
  fillIn('.output-container .field-selection-container:eq(1) .field-name input', 'new_name');

  fillIn('.output-container .top-k-size input', '15');
  fillIn('.output-container .top-k-min-count input', '1500');
  fillIn('.output-container .top-k-display-name input', 'cnt');


  click('.submit-button');
  visit('queries');
  andThen(() => {
    assert.equal(find('.query-description').text().trim(), 'test query');
  });
  triggerEvent('.queries-table .query-name-entry', 'mouseover');
  click('.queries-table .query-name-entry .query-name-actions .link-icon');
  andThen(() => {
    assert.equal(find('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').val());
    visit(`/create/${fragment}`);
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal(find('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
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

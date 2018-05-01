/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { visit, click, fillIn, triggerEvent } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import $ from 'jquery';

let fragment;

module('Acceptance | query linking', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  hooks.afterEach(function() {
    fragment = '';
  });

  function getFragment(link) {
    let index = link.lastIndexOf('/');
    return link.substring(index + 1);
  }

  test('linking a query and navigating to it', async function(assert) {
    assert.expect(5);

    await visit('/queries/new');
    await click('.submit-button');
    await visit('queries');
    assert.equal($('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment($('.queries-table .lt-expanded-row .query-shareable-link input').val());
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
  });

  test('clicking the linking query button twice closes it', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.submit-button');
    await visit('queries');
    assert.equal($('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 0);
  });

  test('linking an invalid query fails', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await visit('queries');
    assert.equal($('.query-description').length, 1);
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 0);
    assert.equal($('.query-description').length, 1);
  });

  test('linking a full query with filters, raw data output with projections and a name works', async function(assert) {
    assert.expect(11);

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
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment($('.queries-table .lt-expanded-row .query-shareable-link input').val());
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
    // The one without any results is the newly created one
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.equal($('.filter-container .rule-filter-container select').val(), 'complex_list_column');
    assert.equal($('.projections-container .field-selection-container:eq(0) .field-name input').val(), 'new_name');
    assert.equal($('.projections-container .field-selection-container:eq(1) .field-name input').val(), 'simple_column');
    assert.equal($('.options-container .aggregation-size input').val(), '40');
  });

  test('linking a full query with filters, grouped data output with groups and fields works', async function(assert) {
    assert.expect(17);

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
    await selectChoose($('.output-container .metrics-container .field-selection-container .metrics-selection')[0], 'Count');
    await selectChoose($('.output-container .metrics-container .metrics-selection')[1], 'Average');
    await selectChoose($('.output-container .metrics-container .field-selection-container .field-selection')[0], 'simple_column');
    await fillIn($('.output-container .metrics-container .field-selection-container:eq(1) .field-name input')[0], 'avg_bar');

    await click('.submit-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment($('.queries-table .lt-expanded-row .query-shareable-link input').val());
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
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

  test('linking a distribution query with number of points works', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #distribution');
    await click('.distribution-type-options #cumulative');
    await click('.output-container .distribution-point-options #number-points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn('.output-container .distribution-type-number-of-points input', '15');

    await click('.submit-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment($('.queries-table .lt-expanded-row .query-shareable-link input').val());
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.ok($('.output-options #distribution').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-type-options #cumulative').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #number-points').parent().hasClass('checked'));
    assert.equal($('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .distribution-type-number-of-points input').val(), '15');
  });

  test('linking a distribution query with generated points works', async function(assert) {
    assert.expect(13);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #distribution');
    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #generate-points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn($('.output-container .distribution-type-point-range input:eq(0)')[0], '1.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(1)')[0], '2.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(2)')[0], '0.5');

    await click('.submit-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment($('.queries-table .lt-expanded-row .query-shareable-link input').val());
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
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

  test('linking a distribution query with points works', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #distribution');
    await click('.output-container .distribution-point-options #points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn('.output-container .distribution-type-points input', '0,0.2,1');

    await click('.submit-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment($('.queries-table .lt-expanded-row .query-shareable-link input').val());
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
    assert.equal($('.queries-table .query-results-entry').last().text().trim(), '--');
    assert.equal($('.queries-table .query-name-entry .query-description').last().text().trim(), 'test query');
    await click($('.queries-table .query-name-entry:eq(1)')[0]);
    assert.ok($('.output-options #distribution').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-type-options #quantile').parent().hasClass('checked'));
    assert.ok($('.output-container .distribution-point-options #points').parent().hasClass('checked'));
    assert.equal($('.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal($('.output-container .distribution-type-points input').val(), '0,0.2,1');
  });

  test('linking a top k query works', async function(assert) {
    assert.expect(14);

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


    await click('.submit-button');
    await visit('queries');
    assert.equal($('.query-description').text().trim(), 'test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.equal($('.queries-table .lt-expanded-row .query-shareable-link input').length, 1);
    fragment = getFragment($('.queries-table .lt-expanded-row .query-shareable-link input').val());
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.equal($('.queries-table .query-name-entry .query-description').length, 2);
    assert.equal($('.queries-table .query-results-entry .length-entry').first().text().trim(), '1 Results');
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
});

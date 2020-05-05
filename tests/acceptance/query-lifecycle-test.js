/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { visit, click, fillIn, triggerEvent, currentURL, find, findAll, blur } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { findIn, findAllIn } from '../helpers/find-helpers';

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
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .delete-icon');
    assert.dom('.query-description').doesNotExist();
  });

  test('creating a query and copying it', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await visit('queries');
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.query-description').exists({ count: 2 });
  });

  test('creating an invalid query and failing to copy it', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await visit('queries');
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.query-description').exists({ count: 1 });
  });

  test('creating multiple queries and deleting them', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await visit('/queries/new');
    await visit('queries');
    assert.dom('.query-description').exists({ count: 2 });
    await triggerEvent(findAll('.queries-table .query-name-entry')[0], 'mouseover');
    await click(findIn('.query-name-actions .delete-icon', findAll('.queries-table .query-name-entry')[0]));
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .delete-icon');
    assert.dom('.query-description').doesNotExist();
  });

  test('creating multiple queries and copying them', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await visit('/queries/new');
    await visit('queries');
    assert.dom('.query-description').exists({ count: 2 });
    await triggerEvent(findAll('.queries-table .query-name-entry')[0], 'mouseover');
    await click(findIn('.query-name-actions .copy-icon', findAll('.queries-table .query-name-entry')[0]));
    assert.dom('.query-description').exists({ count: 3 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click(findIn('.query-name-actions .copy-icon', findAll('.queries-table .query-name-entry')[1]));
    assert.dom('.query-description').exists({ count: 4 });
  });

  test('adding a filter with a simple column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'simple_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    assert.dom('.filter-container .rule-filter-container select').hasValue('simple_column');
    assert.dom('.filter-container .rule-subfield-container input').doesNotExist();
    assert.dom('.filter-container .rule-operator-container select').hasValue('equal');
  });

  test('adding a complex map field column filter with a subfield column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_map_column.*';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    assert.dom('.filter-container .rule-filter-container select').hasValue('complex_map_column.*');
    assert.dom('.filter-container .rule-operator-container select').hasValue('equal');
    assert.dom('.filter-container .rule-subfield-container input').exists({ count: 1 });
  });

  test('adding a complex map field column filter without a subfield column', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_map_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    assert.dom('.filter-container .rule-filter-container select').hasValue('complex_map_column');
    assert.dom('.filter-container .rule-operator-container select').hasValue('is_null');
    assert.dom('.filter-container .rule-subfield-container input').doesNotExist();
  });

  test('adding and removing filter rules', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    assert.dom('.filter-container .rule-container').doesNotExist();
    await click('.filter-container button[data-add=\'rule\']');
    assert.dom('.filter-container .rule-container').exists({ count: 1 });
    await click('.filter-container .rules-list button[data-delete=\'rule\']');
    assert.dom('.filter-container .rule-container').doesNotExist();
  });

  test('raw data output with all columns is selected by default', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    assert.dom(find('.output-options #raw').parentElement).hasClass('checked');
    assert.dom('.output-container .projections-container .add-projection').doesNotExist();
    assert.dom('.projections-container').doesNotExist();
  });

  test('adding and removing raw data output projections', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.projections-container .field-selection-container')[0]), 'new_name');
    assert.dom('.projections-container .column-onlyfield').exists({ count: 2 });
    await click(findIn('.delete-button', findAll('.projections-container .field-selection-container')[1]));
    assert.dom('.projections-container .field-selection-container').exists({ count: 1 });
    // The last one cannot be removed
    assert.dom('.projections-container .field-selection-container .delete-button').doesNotExist();
  });

  test('filling out projection name even when there are errors', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
    assert.dom('.projections-container .column-onlyfield').exists({ count: 1 });
    await fillIn('.options-container .aggregation-size input', '');
    await click('.save-button');
    assert.dom('.projections-container .field-name input').hasValue('simple_column');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
  });

  test('adding a projection with a subfield column', async function(assert) {
    assert.expect(5);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'complex_map_column.*');
    await fillIn('.projections-container .field-selection-container .field-name input', 'new_name');
    assert.dom('.projections-container .field-selection .column-mainfield').exists({ count: 1 });
    await await blur(
      '.projections-container .field-selection-container .field-selection .column-subfield input'
    );
    assert.dom(
      '.projections-container .column-mainfield .ember-power-select-selected-item'
    ).hasText('complex_map_column.*');
    assert.dom('.projections-container .field-selection-container .column-subfield input').hasValue('');
    await fillIn('.projections-container .field-selection-container .field-selection .column-subfield input', 'foo');
    await await blur(
      '.projections-container .field-selection-container .field-selection .column-subfield input'
    );
    assert.dom(
      '.projections-container .column-mainfield .ember-power-select-selected-item'
    ).hasText('complex_map_column.*');
    assert.dom('.projections-container .field-selection-container .column-subfield input').hasValue('foo');
  });

  test('switching to another output data type wipes selected columns', async function(assert) {
    assert.expect(6);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'complex_map_column.*');
    await fillIn(
      findIn('.field-selection .column-subfield input', findAll('.projections-container .field-selection-container')[0]),
      'foo'
    );
    await await blur(
      findIn('.field-selection .column-subfield input', findAll('.projections-container .field-selection-container')[0])
    );
    await fillIn(findIn('.field-name input', findAll('.projections-container .field-selection-container')[0]), 'new_name');

    await click('.output-container .projections-container .add-projection');
    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[1]), 'simple_column');
    await click('.save-button');
    assert.dom('.projections-container .field-selection-container').exists({ count: 2 });
    assert.dom(
      '.projections-container .column-mainfield .ember-power-select-selected-item'
    ).hasText('complex_map_column.*');
    assert.dom('.projections-container .field-selection-container .column-subfield input').hasValue('foo');
    assert.dom('.projections-container .field-selection-container .field-name input').hasValue('new_name');
    // This means that save was also successful
    assert.equal(findIn('.field-name input', findAll('.projections-container .field-selection-container')[1]).value, 'simple_column');
    await click('.output-options #count-distinct');
    await click('.output-options #raw');
    await click('.output-container .raw-sub-options #select');
    assert.dom('.projections-container .field-selection-container').exists({ count: 1 });
  });

  test('aggregation size is only visible when selecting the raw output option', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    assert.dom(find('.output-options #raw').parentElement).hasClass('checked');
    assert.dom(find('.output-container .raw-sub-options #all').parentElement).hasClass('checked');
    assert.dom('.aggregation-size input').exists({ count: 1 });
    await click('.output-options #grouped-data');
    assert.dom(find('.output-options #grouped-data').parentElement).hasClass('checked');
    assert.dom('.aggregation-size input').doesNotExist();
    await click('.output-options #count-distinct');
    assert.dom(find('.output-options #count-distinct').parentElement).hasClass('checked');
    assert.dom('.aggregation-size input').doesNotExist();
    await click('.output-options #distribution');
    assert.dom(find('.output-options #distribution').parentElement).hasClass('checked');
    assert.dom('.aggregation-size input').doesNotExist();
    await click('.output-options #top-k');
    assert.dom(find('.output-options #top-k').parentElement).hasClass('checked');
    assert.dom('.aggregation-size input').doesNotExist();
  });

  test('copying a full query with filters, raw data output with projections and a name works', async function(assert) {
    assert.expect(10);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.filter-container button[data-add=\'rule\']');
    find('.filter-container .rule-filter-container select').value = 'complex_list_column';
    await triggerEvent('.filter-container .rule-filter-container select', 'change');
    await click('.output-container .raw-sub-options #select');
    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'complex_map_column.*');
    await fillIn(
      findIn('.field-selection .column-subfield input', findAll('.projections-container .field-selection-container')[0]),
      'foo'
    );
    await await blur(
      findIn('.field-selection .column-subfield input', findAll('.projections-container .field-selection-container')[0])
    );
    await fillIn(findIn('.field-name input', findAll('.projections-container .field-selection-container')[0]), 'new_name');

    await click('.output-container .projections-container .add-projection');
    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[1]), 'simple_column');

    await fillIn('.options-container .aggregation-size input', '40');
    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description').hasText('test query');
    assert.dom('.queries-table .query-results-entry .length-entry').hasText('1 Results');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry .length-entry')[0]).hasText('1 Results');
    assert.dom(findAll('.queries-table .query-results-entry')[1]).hasText('--');
    assert.dom(findAll('.queries-table .query-name-entry .query-description')[1]).hasText('test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.dom('.filter-container .rule-filter-container select').hasValue('complex_list_column');
    assert.equal(findIn('.field-name input', findAll('.projections-container .field-selection-container')[0]).value, 'new_name');
    assert.equal(findIn('.field-name input', findAll('.projections-container .field-selection-container')[1]).value, 'simple_column');
    assert.dom('.options-container .aggregation-size input').hasValue('40');
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
    await selectChoose(findIn('.field-selection', findAll('.output-container .groups-container .field-selection-container')[0]), 'complex_map_column');
    await selectChoose(findIn('.field-selection', findAll('.output-container .groups-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.output-container .groups-container .field-selection-container')[1]), 'bar');

    await click('.output-container .metrics-container .add-metric');
    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metrics-selection', findAll('.output-container .metrics-container .field-selection-container')[0]), 'Count');
    await selectChoose(findAll('.output-container .metrics-container .metrics-selection')[1], 'Average');
    await selectChoose(findIn('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.output-container .metrics-container .field-selection-container')[1]), 'avg_bar');

    await click('.save-button');
    await visit('queries');
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry')[1]).hasText('--');
    assert.dom(findAll('.queries-table .query-name-entry .query-description')[1]).hasText('test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.dom('.filter-container .rule-filter-container select').hasValue('complex_list_column');
    assert.dom(
      findIn('.column-onlyfield .ember-power-select-selected-item', findAll('.groups-container .field-selection-container')[0])
    ).hasText('complex_map_column');
    assert.equal(findIn('.field-name input', findAll('.groups-container .field-selection-container')[0]).value, 'complex_map_column');
    assert.dom(
      findIn('.column-onlyfield .ember-power-select-selected-item', findAll('.groups-container .field-selection-container')[1])
    ).hasText('simple_column');
    assert.equal(findIn('.field-name input', findAll('.groups-container .field-selection-container')[1]).value, 'bar');
    assert.dom(
      findIn('.metrics-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[0])
    ).hasText('Count');
    assert.equal(findAllIn('.field-selection', findAll('.metrics-container .field-selection-container')[0]).length, 0);
    assert.equal(findIn('.field-name input', findAll('.metrics-container .field-selection-container')[0]).value, '');
    assert.dom(
      findIn('.metrics-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[1])
    ).hasText('Average');
    assert.dom(
      findIn('.field-selection .ember-power-select-selected-item', findAll('.metrics-container .field-selection-container')[1])
    ).hasText('simple_column');
    assert.equal(findIn('.field-name input', findAll('.metrics-container .field-selection-container')[1]).value, 'avg_bar');
  });

  test('distribution output selects quantiles and number of points by default', async function(assert) {
    assert.expect(6);

    await visit('/queries/new');
    await click('.output-options #distribution');
    assert.dom(find('.output-options #distribution').parentElement).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-type-options #quantile').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #number-points').parentElement
    ).hasClass('checked');
    assert.dom('.output-container .fields-selection-container .add-field').doesNotExist();
    assert.dom('.fields-selection-container .field-selection-container').exists({ count: 1 });
    assert.dom('.fields-selection-container .field-selection-container .delete-button').doesNotExist();
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
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry')[1]).hasText('--');
    assert.dom(findAll('.queries-table .query-name-entry .query-description')[1]).hasText('test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.dom(find('.output-options #distribution').parentElement).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-type-options #cumulative').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #number-points').parentElement
    ).hasClass('checked');
    assert.dom(
      '.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item'
    ).hasText('simple_column');
    assert.dom('.output-container .distribution-type-number-of-points input').hasValue('15');
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
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry')[1]).hasText('--');
    assert.dom(findAll('.queries-table .query-name-entry .query-description')[1]).hasText('test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.dom(find('.output-options #distribution').parentElement).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-type-options #frequency').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #generate-points').parentElement
    ).hasClass('checked');
    assert.dom(
      '.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item'
    ).hasText('simple_column');
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
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry')[1]).hasText('--');
    assert.dom(findAll('.queries-table .query-name-entry .query-description')[1]).hasText('test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.dom(find('.output-options #distribution').parentElement).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-type-options #quantile').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #points').parentElement
    ).hasClass('checked');
    assert.dom(
      '.output-container .field-selection-container .column-onlyfield .ember-power-select-selected-item'
    ).hasText('simple_column');
    assert.dom('.output-container .distribution-type-points input').hasValue('0,0.2,1');
  });

  test('copying a top k query works', async function(assert) {
    assert.expect(12);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #top-k');

    await click('.output-container .add-field');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[0]), 'simple_column');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[1]), 'complex_map_column.*');
    await fillIn(findIn('.field-selection .column-subfield input', findAll('.output-container .field-selection-container')[1]), 'foo');
    await await blur(
      findIn('.field-selection .column-subfield input', findAll('.output-container .field-selection-container')[1])
    );
    await fillIn(findIn('.field-name input', findAll('.output-container .field-selection-container')[1]), 'new_name');

    await fillIn('.output-container .top-k-size input', '15');
    await fillIn('.output-container .top-k-min-count input', '1500');
    await fillIn('.output-container .top-k-display-name input', 'cnt');

    await click('.save-button');
    await visit('queries');
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry')[1]).hasText('--');
    assert.dom(findAll('.queries-table .query-name-entry .query-description')[1]).hasText('test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.dom(find('.output-options #top-k').parentElement).hasClass('checked');
    assert.dom(
      findIn('.column-onlyfield .ember-power-select-selected-item', findAll('.output-container .field-selection-container')[0])
    ).hasText('simple_column');
    assert.dom(
      findIn('.column-mainfield .ember-power-select-selected-item', findAll('.output-container .field-selection-container')[1])
    ).hasText('complex_map_column.*');
    assert.equal(findIn('.column-subfield input', findAll('.output-container .field-selection-container')[1]).value, 'foo');
    assert.equal(findIn('.field-name input', findAll('.output-container .field-selection-container')[1]).value, 'new_name');
    assert.dom('.output-container .top-k-size input').hasValue('15');
    assert.dom('.output-container .top-k-min-count input').hasValue('1500');
    assert.dom('.output-container .top-k-display-name input').hasValue('cnt');
  });

  test('distribution queries are sticky when switching to and from frequency to cumulative frequency', async function(assert) {
    assert.expect(11);

    await visit('/queries/new');
    await click('.output-options #distribution');

    await click('.distribution-type-options #cumulative');
    await click('.output-container .distribution-point-options #number-points');
    await fillIn('.output-container .distribution-type-number-of-points input', '15');
    await click('.distribution-type-options #frequency');
    assert.dom(
      find('.output-container .distribution-type-options #frequency').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #number-points').parentElement
    ).hasClass('checked');
    assert.dom('.output-container .distribution-type-number-of-points input').hasValue('15');

    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #points');
    await fillIn('.output-container .distribution-type-points input', '1,4,51,5');
    await click('.distribution-type-options #cumulative');
    assert.dom(
      find('.output-container .distribution-type-options #cumulative').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #points').parentElement
    ).hasClass('checked');
    assert.dom('.output-container .distribution-type-points input').hasValue('1,4,51,5');

    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #generate-points');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '1.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '2.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '0.5');
    await click('.distribution-type-options #cumulative');
    assert.dom(
      find('.output-container .distribution-type-options #cumulative').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #generate-points').parentElement
    ).hasClass('checked');
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
    assert.dom(
      find('.output-container .distribution-type-options #frequency').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #number-points').parentElement
    ).hasClass('checked');
    assert.dom('.output-container .distribution-type-number-of-points input').hasValue('11');

    await click('.distribution-type-options #quantile');
    await click('.output-container .distribution-point-options #points');
    await fillIn('.output-container .distribution-type-points input', '0,0.5,0.4');
    await click('.distribution-type-options #cumulative');
    assert.dom(
      find('.output-container .distribution-type-options #cumulative').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #points').parentElement
    ).hasClass('checked');
    assert.dom('.output-container .distribution-type-points input').hasValue('');

    await click('.distribution-type-options #quantile');
    await click('.output-container .distribution-point-options #generate-points');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '0.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '0.75');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '0.5');
    await click('.distribution-type-options #cumulative');
    assert.dom(
      find('.output-container .distribution-type-options #cumulative').parentElement
    ).hasClass('checked');
    assert.dom(
      find('.output-container .distribution-point-options #generate-points').parentElement
    ).hasClass('checked');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[0].value, '');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[1].value, '');
    assert.equal(findAll('.output-container .distribution-type-point-range input')[2].value, '');
  });

  test('creating a valid query and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.dom('.query-name-entry').exists({ count: 1 });
    assert.dom('.query-unsaved').doesNotExist();
  });

  test('editing a query field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.dom('.query-name-entry').exists({ count: 1 });
    assert.dom('.query-unsaved').doesNotExist();
    await click('.queries-table .query-name-entry .query-description');
    await fillIn('.name-container input', 'test query');
    await visit('queries');
    assert.dom('.query-name-entry').exists({ count: 1 });
    assert.dom('.query-unsaved').exists({ count: 1 });
  });

  test('adding a projection field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.dom('.query-name-entry').exists({ count: 1 });
    assert.dom('.query-unsaved').doesNotExist();
    await click('.queries-table .query-name-entry .query-description');
    await click('.output-container .raw-sub-options #select');
    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'simple_column');
    await visit('queries');
    assert.dom('.query-name-entry').exists({ count: 1 });
    assert.dom('.query-unsaved').exists({ count: 1 });
  });

  test('adding a group field and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.save-button');
    await visit('queries');
    assert.dom('.query-name-entry').exists({ count: 1 });
    assert.dom('.query-unsaved').doesNotExist();
    await click('.queries-table .query-name-entry .query-description');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await selectChoose('.output-container .groups-container .field-selection-container .field-selection', 'simple_column');
    await visit('queries');
    assert.dom('.query-name-entry').exists({ count: 1 });
    assert.dom('.query-unsaved').exists({ count: 1 });
  });

  test('creating an invalid query and checking if it is indicated as needing attention', async function(assert) {
    assert.expect(2);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await visit('queries');
    assert.dom('.query-name-entry').exists({ count: 1 });
    assert.dom('.query-unsaved').exists({ count: 1 });
  });
});

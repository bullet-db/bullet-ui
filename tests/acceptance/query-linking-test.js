/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import {
  visit,
  click,
  fillIn,
  triggerEvent,
  find,
  findAll,
  blur
} from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { findIn, findAllIn } from '../helpers/find-helpers';

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
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').exists({ count: 1 });
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').value);
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry .length-entry')[0]).hasText('1 Results');
    assert.dom(findAll('.queries-table .query-results-entry')[1]).hasText('--');
  });

  test('clicking the linking query button twice closes it', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').exists({ count: 1 });
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').doesNotExist();
  });

  test('linking an invalid query fails', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await click('.output-container .projections-container .add-projection');
    await visit('queries');
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').doesNotExist();
    assert.dom('.query-description').exists({ count: 1 });
  });

  test('linking a full query with filters, raw data output with projections and a name works', async function(assert) {
    assert.expect(11);

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
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').exists({ count: 1 });
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').value);
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry .length-entry')[0]).hasText('1 Results');
    // The one without any results is the newly created one
    assert.dom(findAll('.queries-table .query-results-entry')[1]).hasText('--');
    assert.dom(findAll('.queries-table .query-name-entry .query-description')[1]).hasText('test query');
    await click(findAll('.queries-table .query-name-entry')[1]);
    assert.dom('.filter-container .rule-filter-container select').hasValue('complex_list_column');
    assert.equal(findIn('.field-name input', findAll('.projections-container .field-selection-container')[0]).value, 'new_name');
    assert.equal(findIn('.field-name input', findAll('.projections-container .field-selection-container')[1]).value, 'simple_column');
    assert.dom('.options-container .aggregation-size input').hasValue('40');
  });

  test('linking a full query with filters, grouped data output with groups and fields works', async function(assert) {
    assert.expect(17);

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

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').exists({ count: 1 });
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').value);
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry .length-entry')[0]).hasText('1 Results');
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
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').exists({ count: 1 });
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').value);
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry .length-entry')[0]).hasText('1 Results');
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

  test('linking a distribution query with generated points works', async function(assert) {
    assert.expect(13);

    await visit('/queries/new');
    await fillIn('.name-container input', 'test query');
    await click('.output-options #distribution');
    await click('.distribution-type-options #frequency');
    await click('.output-container .distribution-point-options #generate-points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '1.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '2.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '0.5');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').exists({ count: 1 });
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').value);
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry .length-entry')[0]).hasText('1 Results');
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
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').exists({ count: 1 });
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').value);
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry .length-entry')[0]).hasText('1 Results');
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

  test('linking a top k query works', async function(assert) {
    assert.expect(14);

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


    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description').hasText('test query');
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .link-icon');
    assert.dom('.queries-table .lt-expanded-row .query-shareable-link input').exists({ count: 1 });
    fragment = getFragment(find('.queries-table .lt-expanded-row .query-shareable-link input').value);
    await visit(`/create/${fragment}`);
    await visit('queries');
    assert.dom('.queries-table .query-name-entry .query-description').exists({ count: 2 });
    assert.dom(findAll('.queries-table .query-results-entry .length-entry')[0]).hasText('1 Results');
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
});

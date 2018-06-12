/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { later } from '@ember/runloop';
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { visit, click, currentRouteName, find, findAll } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';

module('Acceptance | query results lifecycle', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('query submission and result navigation', async function(assert) {
    assert.expect(3);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    await visit('queries/new');
    await click('.submit-button');

    await visit('queries');
    assert.equal(find('.queries-table .query-results-entry .length-entry').textContent.trim(), '1 Results');
    await click('.queries-table .query-results-entry');
    await click('.query-results-entry-popover .results-table .result-date-entry');
    assert.equal(currentRouteName(), 'result');
    assert.equal(findAll('pre').length, 1);
  });

  test('query submission with raw output with projections opens the table view by default', async function(assert) {
    assert.expect(2);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    assert.equal(findAll('.records-table').length, 1);
  });

  test('query submission with grouped data opens the table view by default', async function(assert) {
    assert.expect(2);
    this.mockedAPI.mock([RESULTS.GROUP], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await selectChoose('.output-container .groups-container .field-selection-container .field-selection', 'complex_map_column');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    assert.equal(findAll('.records-table').length, 1);
  });

  test('result table popover open and close', async function(assert) {
    assert.expect(3);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    await visit('queries/new');
    await click('.submit-button');

    await visit('queries');
    assert.equal(find('.queries-table .query-results-entry .length-entry').textContent.trim(), '1 Results');
    await click('.queries-table .query-results-entry');
    assert.equal(findAll('.query-results-entry-popover').length, 1);
    await click('.query-results-entry-popover .close-button');
    // Bootstrap popovers hiding is async but andThen doesn't catch it (May need to wrap closePopover in a run loop)...
    later(() => {
      assert.equal(findAll('.query-results-entry-popover .results-table .result-date-entry').length, 0);
    }, 500);
  });

  test('query multiple submissions and results clearing', async function(assert) {
    assert.expect(2);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    await visit('queries/new');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry .query-name-actions .edit-icon');
    await click('.submit-button');
    await visit('queries');
    assert.equal(find('.queries-table .query-results-entry .length-entry').textContent.trim(), '2 Results');
    await click('.queries-table .query-results-entry');
    await click('.query-results-entry .clear-history');
    assert.equal(find('.queries-table .query-results-entry').textContent.trim(), '--');
  });
});

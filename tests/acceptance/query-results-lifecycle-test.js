/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import { setupForAcceptanceTest } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { visit, click, currentRouteName } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { assertTooltipNotRendered, assertTooltipNotVisible, assertTooltipVisible } from 'ember-tooltips/test-support/dom';

module('Acceptance | query results lifecycle', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('query submission and result navigation', async function(assert) {
    assert.expect(5);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    await visit('queries/build');
    await click('.submit-button');
    await visit('queries');
    assert.dom('.queries-table .query-results-entry .length-entry').hasText('1 Results');
    assertTooltipNotRendered(assert);
    await click('.queries-table .query-results-entry');
    assertTooltipVisible(assert);
    await click('.query-results-entry-popover-body .results-table .result-date-entry');
    assert.equal(currentRouteName(), 'result');
    assert.dom('pre').exists({ count: 1 });
  });

  test('query submission with raw output with projections opens the table view by default', async function(assert) {
    assert.expect(2);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-container .raw-sub-options #select');
    await selectChoose('.projections-container .field-selection-container .field-selection', 'simple_column');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    assert.dom('.records-table').exists({ count: 1 });
  });

  test('query submission with grouped data opens the table view by default', async function(assert) {
    assert.expect(2);
    this.mockedAPI.mock([RESULTS.GROUP], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #grouped-data');
    await click('.output-container .groups-container .add-group');
    await selectChoose('.output-container .groups-container .field-selection-container .field-selection', 'complex_map_column');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    assert.dom('.records-table').exists({ count: 1 });
  });

  test('result table popover open and close', async function(assert) {
    assert.expect(4);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    await visit('queries/build');
    await click('.submit-button');

    await visit('queries');
    assert.dom('.queries-table .query-results-entry .length-entry').hasText('1 Results');
    assertTooltipNotRendered(assert);
    await click('.queries-table .query-results-entry');
    assertTooltipVisible(assert);
    await click('.query-results-entry-popover-wrapper .close-button');
    assertTooltipNotVisible(assert);
  });

  test('query multiple submissions and results clearing', async function(assert) {
    assert.expect(2);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    await visit('queries/build');
    await click('.submit-button');
    await visit('queries');
    await click('.queries-table .query-name-entry .query-name-actions .edit-icon');
    await click('.submit-button');
    await visit('queries');
    assert.dom('.queries-table .query-results-entry .length-entry').hasText('2 Results');
    await click('.queries-table .query-results-entry');
    await click('.query-results-entry .clear-history');
    assert.dom('.queries-table .query-results-entry').hasText('--');
  });
});

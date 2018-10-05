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
import { visit, click, fillIn, currentRouteName, currentURL, find, findAll, triggerEvent } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { findContains } from '../helpers/find-helpers';

module('Acceptance | result lifecycle', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('it has a link to go back to the query from the result', async function(assert) {
    assert.expect(2);

    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);
    await visit('/queries/new');
    let createdQuery = currentURL();
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    await click('.query-blurb-wrapper');
    assert.equal(currentURL(), createdQuery);
  });

  test('it lets you swap between raw and tabular forms', async function(assert) {
    assert.expect(4);

    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    await click('.table-view');
    assert.equal(findAll('.pretty-json-container').length, 0);
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 9);
    await click('.raw-view');
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(findAll('.pretty-json-container').length, 1);
  });

  test('it lets you expand metadata in results', async function(assert) {
    assert.expect(7);
    this.mockedAPI.mock([RESULTS.COUNT_DISTINCT], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #count-distinct');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    assert.equal(findAll('.records-table').length, 1);
    assert.equal(findAll('.window-metadata').length, 1);
    assert.notOk(find('.window-metadata').classList.contains('is-expanded'));
    assert.equal(findAll('.window-metadata pre').length, 0);
    await click('.window-metadata .expand-bar');
    assert.ok(find('.window-metadata').classList.contains('is-expanded'));
    assert.equal(findAll('.window-metadata pre').length, 1);
  });

  test('it lets you expand result entries in a popover', async function(assert) {
    assert.expect(4);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    await click('.table-view');
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 3);
    await click(findContains('.records-table .lt-body .lt-row .record-entry .plain-entry', 'test'));
    assert.equal(findAll('.record-entry-popover').length, 1);
    assert.equal(find('.record-entry-popover .record-popover-body pre').textContent.trim(), 'test');
    await click('.record-entry-popover .close-button');
    later(() => {
      assert.equal(findAll('.record-entry-popover').length, 0);
    }, 500);
  });

  test('it lets swap between a row, tabular and pivot chart views when it is a raw query', async function(assert) {
    assert.expect(12);

    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    await click('.table-view');
    assert.equal(findAll('.records-charter').length, 0);
    assert.equal(findAll('.pretty-json-container').length, 0);
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 9);
    await click('.raw-view');
    assert.equal(findAll('.records-charter').length, 0);
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(findAll('.pretty-json-container').length, 1);
    await click('.chart-view');
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(findAll('.pretty-json-container').length, 0);
    assert.equal(findAll('.records-charter').length, 1);
    assert.equal(findAll('.pivot-table-container').length, 1);
    assert.equal(findAll('.pvtUi').length, 1);
    // Only pivot view
    assert.equal(findAll('.records-charter .chart-control').length, 0);
  });

  test('it lets you swap between a row, tabular, line, bar, pie and pivot chart views when it is not a raw query', async function(assert) {
    assert.expect(17);

    this.mockedAPI.mock([RESULTS.DISTRIBUTION], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.output-container .distribution-point-options #points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn('.output-container .distribution-type-points input', '0,0.2,1');
    await click('.submit-button');

    await click('.raw-view');
    assert.equal(findAll('.records-charter').length, 0);
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(findAll('.pretty-json-container').length, 1);
    await click('.table-view');
    assert.equal(findAll('.records-charter').length, 0);
    assert.equal(findAll('.pretty-json-container').length, 0);
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 9);
    await click('.chart-view');
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(findAll('.pretty-json-container').length, 0);
    assert.equal(findAll('.records-charter').length, 1);
    assert.equal(findAll('.records-charter .chart-control.pie-view').length, 1);
    assert.equal(findAll('.records-charter .chart-control.line-view').length, 1);
    assert.equal(findAll('.records-charter .chart-control.bar-view').length, 1);
    assert.ok(find('.records-charter .chart-control.line-view').classList.contains('active'));
    assert.equal(findAll('.records-charter canvas').length, 1);
    await click('.records-charter .pivot-control');
    assert.ok(find('.records-charter .pivot-control').classList.contains('active'));
    assert.equal(findAll('.records-charter .pivot-table-container').length, 1);
    assert.equal(findAll('.records-charter .pvtUi').length, 1);
  });

  test('it saves and restores pivot table options', async function(assert) {
    assert.expect(7);

    this.mockedAPI.mock([RESULTS.DISTRIBUTION], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.output-container .distribution-point-options #points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn('.output-container .distribution-type-points input', '0,0.2,1');
    await click('.submit-button');

    await click('.chart-view');
    await click('.records-charter .pivot-control');
    assert.ok(find('.records-charter .pivot-control').classList.contains('active'));
    assert.equal(findAll('.pivot-table-container').length, 1);
    assert.equal(findAll('.pvtUi').length, 1);
    assert.equal(find('.pvtUi select.pvtRenderer').value, 'Table');
    find('.pivot-table-container select.pvtRenderer').value = 'Bar Chart';
    await triggerEvent('.pivot-table-container select.pvtRenderer', 'change');
    find('.pivot-table-container select.pvtAggregator').value = 'Sum';
    await triggerEvent('.pivot-table-container select.pvtAggregator', 'change');
    await visit('queries');
    assert.equal(find('.queries-table .query-results-entry .length-entry').textContent.trim(), '1 Results');
    await click('.queries-table .query-results-entry');
    await click('.query-results-entry-popover .results-table .result-date-entry');
    await click('.chart-view');
    await click('.records-charter .pivot-control');
    assert.equal(find('.pvtUi select.pvtRenderer').value, 'Bar Chart');
    assert.equal(find('.pvtUi select.pvtAggregator').value, 'Sum');
  });

  test('it lets you swap between raw and collapsible json forms', async function(assert) {
    assert.expect(10);

    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    assert.equal(findAll('.records-charter').length, 0);
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(findAll('.raw-display').length, 1);
    assert.equal(findAll('.pretty-json-container').length, 1);
    assert.equal(findAll('.raw-json-display').length, 0);
    await click('.records-viewer .mode-toggle .off-view');
    assert.equal(findAll('.records-charter').length, 0);
    assert.equal(findAll('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(findAll('.raw-display').length, 1);
    assert.equal(findAll('.pretty-json-container').length, 0);
    assert.equal(findAll('.raw-json-display').length, 1);
  });

  test('it lets you rerun a query', async function(assert) {
    assert.expect(3);

    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    await click('.rerun-button');
    assert.equal(currentRouteName(), 'result');
    await visit('queries');
    assert.equal(find('.queries-table .query-results-entry .length-entry').textContent.trim(), '2 Results');
  });
});

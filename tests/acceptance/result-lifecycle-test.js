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
import {
  visit,
  click,
  fillIn,
  currentRouteName,
  currentURL,
  find,
  findAll,
  triggerEvent
} from '@ember/test-helpers';
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
    assert.dom('.pretty-json-container').doesNotExist();
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 9 });
    await click('.raw-view');
    assert.dom('.lt-body .lt-row .lt-cell').doesNotExist();
    assert.dom('.pretty-json-container').exists({ count: 1 });
  });

  test('it lets you expand metadata in results', async function(assert) {
    assert.expect(7);
    this.mockedAPI.mock([RESULTS.COUNT_DISTINCT], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.output-options #count-distinct');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    assert.dom('.records-table').exists({ count: 1 });
    assert.dom('.window-metadata').exists({ count: 1 });
    assert.dom('.window-metadata').hasNoClass('is-expanded');
    assert.dom('.window-metadata pre').doesNotExist();
    await click('.window-metadata .expand-bar');
    assert.dom('.window-metadata').hasClass('is-expanded');
    assert.dom('.window-metadata pre').exists({ count: 1 });
  });

  test('it lets you expand result entries in a popover', async function(assert) {
    assert.expect(4);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    await click('.table-view');
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 3 });
    await click(findContains('.records-table .lt-body .lt-row .record-entry .plain-entry', 'test'));
    assert.dom('.record-entry-popover').exists({ count: 1 });
    assert.dom('.record-entry-popover .record-popover-body pre').hasText('test');
    await click('.record-entry-popover .close-button');
    later(() => {
      assert.dom('.record-entry-popover').doesNotExist();
    }, 500);
  });

  test('it lets swap between a row, tabular and pivot chart views when it is a raw query', async function(assert) {
    assert.expect(12);

    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    await click('.table-view');
    assert.dom('.records-charter').doesNotExist();
    assert.dom('.pretty-json-container').doesNotExist();
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 9 });
    await click('.raw-view');
    assert.dom('.records-charter').doesNotExist();
    assert.dom('.lt-body .lt-row .lt-cell').doesNotExist();
    assert.dom('.pretty-json-container').exists({ count: 1 });
    await click('.chart-view');
    assert.dom('.lt-body .lt-row .lt-cell').doesNotExist();
    assert.dom('.pretty-json-container').doesNotExist();
    assert.dom('.records-charter').exists({ count: 1 });
    assert.dom('.pivot-table-container').exists({ count: 1 });
    assert.dom('.pvtUi').exists({ count: 1 });
    // Only pivot view
    assert.dom('.records-charter .chart-control').doesNotExist();
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
    assert.dom('.records-charter').doesNotExist();
    assert.dom('.lt-body .lt-row .lt-cell').doesNotExist();
    assert.dom('.pretty-json-container').exists({ count: 1 });
    await click('.table-view');
    assert.dom('.records-charter').doesNotExist();
    assert.dom('.pretty-json-container').doesNotExist();
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 9 });
    await click('.chart-view');
    assert.dom('.lt-body .lt-row .lt-cell').doesNotExist();
    assert.dom('.pretty-json-container').doesNotExist();
    assert.dom('.records-charter').exists({ count: 1 });
    assert.dom('.records-charter .chart-control.pie-view').exists({ count: 1 });
    assert.dom('.records-charter .chart-control.line-view').exists({ count: 1 });
    assert.dom('.records-charter .chart-control.bar-view').exists({ count: 1 });
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.records-charter canvas').exists({ count: 1 });
    await click('.records-charter .pivot-control');
    assert.dom('.records-charter .pivot-control').hasClass('active');
    assert.dom('.records-charter .pivot-table-container').exists({ count: 1 });
    assert.dom('.records-charter .pvtUi').exists({ count: 1 });
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
    assert.dom('.records-charter .pivot-control').hasClass('active');
    assert.dom('.pivot-table-container').exists({ count: 1 });
    assert.dom('.pvtUi').exists({ count: 1 });
    assert.dom('.pvtUi select.pvtRenderer').hasValue('Table');
    find('.pivot-table-container select.pvtRenderer').value = 'Bar Chart';
    await triggerEvent('.pivot-table-container select.pvtRenderer', 'change');
    find('.pivot-table-container select.pvtAggregator').value = 'Sum';
    await triggerEvent('.pivot-table-container select.pvtAggregator', 'change');
    await visit('queries');
    assert.dom('.queries-table .query-results-entry .length-entry').hasText('1 Results');
    await click('.queries-table .query-results-entry');
    await click('.query-results-entry-popover .results-table .result-date-entry');
    await click('.chart-view');
    await click('.records-charter .pivot-control');
    assert.dom('.pvtUi select.pvtRenderer').hasValue('Bar Chart');
    assert.dom('.pvtUi select.pvtAggregator').hasValue('Sum');
  });

  test('it lets you swap between raw and collapsible json forms', async function(assert) {
    assert.expect(10);

    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    assert.dom('.records-charter').doesNotExist();
    assert.dom('.lt-body .lt-row .lt-cell').doesNotExist();
    assert.dom('.raw-display').exists({ count: 1 });
    assert.dom('.pretty-json-container').exists({ count: 1 });
    assert.dom('.raw-json-display').doesNotExist();
    await click('.records-viewer .mode-toggle .off-view');
    assert.dom('.records-charter').doesNotExist();
    assert.dom('.lt-body .lt-row .lt-cell').doesNotExist();
    assert.dom('.raw-display').exists({ count: 1 });
    assert.dom('.pretty-json-container').doesNotExist();
    assert.dom('.raw-json-display').exists({ count: 1 });
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
    assert.dom('.queries-table .query-results-entry .length-entry').hasText('2 Results');
  });
});

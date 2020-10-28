/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import { setupForAcceptanceTest } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { currentRouteName, visit, click, } from '@ember/test-helpers';
import { assertTooltipNotRendered, assertTooltipVisible } from 'ember-tooltips/test-support/dom';

module('Acceptance | bql results lifecycle', function(hooks) {
  setupForAcceptanceTest(hooks);

  test('bql query submission and result navigation', async function(assert) {
    assert.expect(5);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    await visit('queries/bql');
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
});

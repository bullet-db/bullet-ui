/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { visit, currentURL } from '@ember/test-helpers';

module('Acceptance | query error', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.BASIC);

  test('visiting a non-existant query', async function(assert) {
    await visit('/query/foo');

    assert.equal(currentURL(), '/errored');
  });
});

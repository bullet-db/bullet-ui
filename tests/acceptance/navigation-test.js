/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import { setupForAcceptanceTest } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { click, visit, currentRouteName, currentURL } from '@ember/test-helpers';
import { findContains } from 'bullet-ui/tests/helpers/find-helpers';

module('Acceptance | navigation', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.BASIC);

  test('visiting / and redirecting to queries', async function(assert) {
    await visit('/');
    assert.equal(currentURL(), '/queries');
  });

  test('visiting a non-existant query', async function(assert) {
    await visit('/query/foo');
    assert.equal(currentURL(), '/not-found');
  });

  test('visiting a page and click past queries and results', async function(assert) {
    await visit('/schema');
    await click(findContains('.left-bar .left-bar-link', 'Queries'));
    assert.equal(currentURL(), '/queries');
  });

  test('visiting / and going to the schema page', async function(assert) {
    await visit('/');
    await click(findContains('.left-bar .left-bar-link', 'Schema'));
    assert.equal(currentRouteName(), 'schema');
  });

  test('visiting / and going somewhere and coming back to the index page', async function(assert) {
    await visit('/schema');
    await click(findContains('.left-bar .left-bar-link', 'Queries'));
    await click('.queries-list .add-button');
    await click('.navbar-logo > a');
    assert.equal(currentURL(), '/queries');
  });
});

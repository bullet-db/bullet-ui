/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { click, visit, currentRouteName, currentURL } from '@ember/test-helpers';
import $ from 'jquery';

module('Acceptance | navigation', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.BASIC);

  test('visiting / and redirecting to queries', async function(assert) {
    await visit('/');
    assert.equal(currentURL(), '/queries');
  });

  test('visiting a non-existant query', async function(assert) {
    await visit('/query/foo');
    assert.equal(currentURL(), '/errored');
  });

  test('visiting a page and click past queries and results', async function(assert) {
    await visit('/schema');
    await click($('.left-bar .left-bar-link:contains(\'Queries\')')[0]);
    assert.equal(currentURL(), '/queries');
  });

  test('visiting / and going to the schema page', async function(assert) {
    await visit('/');
    await click($('.left-bar .left-bar-link:contains(\'Schema\')')[0]);
    assert.equal(currentRouteName(), 'schema');
  });

  test('visiting / and going somewhere and coming back to the index page', async function(assert) {
    await visit('/schema');
    await click($('.left-bar .left-bar-link:contains(\'Queries\')')[0]);
    await click('.queries-list .add-button');
    await click('.navbar-logo > a');
    assert.equal(currentURL(), '/queries');
  });
});

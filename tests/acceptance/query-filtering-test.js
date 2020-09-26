/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { visit, currentRouteName } from '@ember/test-helpers';
import { setupForAcceptanceTest, setupForMockSettings } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import QUERIES from 'bullet-ui/tests/fixtures/queries';

function setDefaultQuery(context, defaultQuery) {
  let settings = context.owner.lookup('settings:mocked');
  settings.set('defaultQuery', defaultQuery);
}

module('Acceptance | query filtering', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.ALL);
  // Inject nothing first for defaultQuery. Each test changes it
  setupForMockSettings(hooks, '');

  test('it can create all the various types of fields', async function(assert) {
    setDefaultQuery(this, QUERIES.ALL_SIMPLE);
    assert.expect(1);
    await visit('/queries/new');
    assert.equal(currentRouteName(), 'query');
  });

  test('it can create a filter with all the operators', async function(assert) {
    setDefaultQuery(this, QUERIES.ALL_OPERATORS);
    assert.expect(1);
    await visit('/queries/new');
    assert.equal(currentRouteName(), 'query');
  });
});

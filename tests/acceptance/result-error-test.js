/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import {
  visit,
  currentURL,
  click,
  currentRouteName,
  findAll
} from '@ember/test-helpers';

module('Acceptance | result error', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('visiting a non-existant result', async function(assert) {
    await visit('/result/foo');

    assert.equal(currentURL(), '/not-found');
  });

  test('it shows an error display when receiving an error metadata response', async function(assert) {
    assert.expect(2);
    this.mockedAPI.mock([RESULTS.ERROR], COLUMNS.BASIC);

    await visit('/queries/new');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    assert.dom('.records-container .killed').exists({ count: 1 });
  });

  test('it handles a fail response from the client by still display the result', async function(assert) {
    assert.expect(2);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    this.mockedAPI.sendFailMessageAt(0);

    await visit('/queries/new');
    await click('.submit-button');
    assert.equal(currentRouteName(), 'result');
    assert.dom('.records-container .raw-display').exists({ count: 1 });
  });
});

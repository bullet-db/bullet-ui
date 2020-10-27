/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import ERRORS from 'bullet-ui/tests/fixtures/errors';
import { setupForValidationEndpoint } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { visit, click, findAll } from '@ember/test-helpers';

module('Acceptance | bql validation', function(hooks) {
  setupForValidationEndpoint(hooks, COLUMNS.BASIC, ERRORS.SINGLE_LINE);

  test('bql query showing a line validation message', async function(assert) {
    this.mockedAPI.failValidate(COLUMNS.BASIC, ERRORS.SINGLE_LINE);
    assert.expect(2);
    await visit('/queries/bql');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').hasText(
      'Test:Error at line 15, character 3'
    );
  });

  test('bql query showing a general validation message', async function(assert) {
    this.mockedAPI.failValidate(COLUMNS.BASIC, ERRORS.SINGLE_NO_LINE);
    assert.expect(2);
    await visit('/queries/bql');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').hasText('Test:Error');
  });

  test('bql query showing mulitple validation messages', async function(assert) {
    this.mockedAPI.failValidate(COLUMNS.BASIC, ERRORS.MULTIPLE);
    assert.expect(5);
    await visit('/queries/bql');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 4 });
    let errors = findAll('.validation-container .simple-alert .alert-message .error-list li');
    assert.dom(errors[0]).hasText('Test:Error');
    assert.dom(errors[1]).hasText('Test Error');
    assert.dom(errors[2]).hasText('Test:Error at line 1, character 3');
    assert.dom(errors[3]).hasText('Another Error at line 2, character 13');
  });
});

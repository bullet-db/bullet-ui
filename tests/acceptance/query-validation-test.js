/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { mockAPI } from '../helpers/pretender';

let server;

moduleForAcceptance('Acceptance | query validation', {
  beforeEach() {
    // Wipe out localstorage because we are creating here
    window.localStorage.clear();
    server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
  }
});

test('query showing filter validation messages', function(assert) {
  assert.expect(2);
  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  click('.save-button');

  andThen(function() {
    assert.ok(find('.filter-container .rules-list .rule-container').hasClass('has-error'));
    assert.equal(find('.filter-container .rules-list .error-container').attr('data-original-title'), 'No filter selected');
  });
});

test('query showing aggregation validation messages', function(assert) {
  assert.expect(4);
  visit('/queries/new');
  fillIn('.options-container .aggregation-size input', '-1');
  click('.submit-button');
  andThen(function() {
    assert.equal(find('.validation-container .alert-message > span').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').text().trim(),
                 'Maximum results must be a positive integer');
    assert.equal(find('.aggregation-size').siblings('.error-tooltip-link').length, 1);
  });
});

test('query showing options validation messages', function(assert) {
  assert.expect(4);
  visit('/queries/new');
  fillIn('.options-container .query-duration input', '-1');
  click('.submit-button');
  andThen(function() {
    assert.equal(find('.validation-container .alert-message > span').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').text().trim(),
                 'Duration must be a positive integer');
    assert.equal(find('.query-duration').siblings('.error-tooltip-link').length, 1);
  });
});

test('selecting count distinct without adding fields is an error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #count-distinct');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').text().trim(),
                 'A field needs to be selected first');
  });
});

test('selecting grouped data without adding fields or metrics is an error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #grouped-data');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').text().trim(),
                 'If you are grouping data, you must add at least one Group Field and/or Metric Field');
  });
});

test('query showing multiple error validation messages', function(assert) {
  assert.expect(4);
  visit('/queries/new');
  click('.output-container .raw-sub-options #select');
  fillIn('.options-container .query-duration input', '-1');
  click('.save-button');

  andThen(function() {
    assert.equal(find('.validation-container .alert-message > span').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('Duration must be a positive integer'));
    assert.ok(text.includes('No field selected'));
  });
});

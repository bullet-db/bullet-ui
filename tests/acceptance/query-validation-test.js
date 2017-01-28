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
    server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);
    return window.localforage.setDriver(window.localforage.LOCALSTORAGE);
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
    return window.localforage.clear();
  }
});

test('query showing filter validation messages', function(assert) {
  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  click('.save-button');

  andThen(function() {
    assert.ok(find('.filter-container .rules-list .rule-container').hasClass('has-error'));
    assert.equal(find('.filter-container .rules-list .error-container').attr('data-original-title'), 'No filter selected');
  });
});

test('query showing projection validation messages', function(assert) {
  visit('/queries/new');
  click('.projections-container .projection-options #select');
  click('.projections-container .add-button');
  andThen(function() {
    assert.equal(find('.projection-container .validated-input .error-tooltip-link').length, 2);
  });
  click('.submit-button');

  andThen(function() {
    assert.equal(find('.validation-container .alert-message').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal(find('.projection-container .validated-input .error-tooltip-link').length, 2);
  });
});

test('query showing aggregation validation messages', function(assert) {
  visit('/queries/new');
  fillIn('.options-container .aggregation-size input', '-1');
  click('.submit-button');
  andThen(function() {
    assert.equal(find('.validation-container .alert-message').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal(find('.aggregation-size').siblings('.error-tooltip-link').length, 1);
  });
});

test('query showing options validation messages', function(assert) {
  visit('/queries/new');
  fillIn('.options-container .query-duration input', '-1');
  click('.submit-button');
  andThen(function() {
    assert.equal(find('.validation-container .alert-message').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal(find('.query-duration').siblings('.error-tooltip-link').length, 1);
  });
});

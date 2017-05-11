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
  suppressLogging: true,

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

test('selecting distributions without a field and no number of points show validation messages', function(assert) {
  assert.expect(4);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #quantile');
  fillIn('.output-container .distribution-type-number-of-points input', '');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('A field needs to be selected first'));
    assert.ok(text.includes('You must specify the Number of Points you want to generate'));
  });
});

test('selecting distributions with a non-positive number of points is a validation error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #quantile');
  fillIn('.output-container .distribution-type-number-of-points input', '-25');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('You must specify a positive Number of Points'));
  });
});

test('selecting distributions with too many points is a validation error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #quantile');
  fillIn('.output-container .distribution-type-number-of-points input', '2500');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('The maintainer has set the maximum number of points you can generate to be 100'));
  });
});

test('selecting distributions without a field and no generated points show validation messages', function(assert) {
  assert.expect(4);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #quantile');
  click('.distribution-point-options #generate-points');
  fillIn('.output-container .distribution-type-point-range input:eq(0)', '');
  fillIn('.output-container .distribution-type-point-range input:eq(1)', '');
  fillIn('.output-container .distribution-type-point-range input:eq(2)', '');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('A field needs to be selected first'));
    assert.ok(text.includes('You must specify the Start, End and Increment for the points you want to generate'));
  });
});

test('selecting distributions with incorrectly generated points is an error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #quantile');
  click('.distribution-point-options #generate-points');
  fillIn('.output-container .distribution-type-point-range input:eq(0)', '0.5');
  fillIn('.output-container .distribution-type-point-range input:eq(1)', '0.5');
  fillIn('.output-container .distribution-type-point-range input:eq(2)', '0.05');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('You must specify Start less than End'));
  });
});

test('selecting distributions with non positive increment is a validation error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #frequency');
  click('.distribution-point-options #generate-points');
  fillIn('.output-container .distribution-type-point-range input:eq(0)', '1.5');
  fillIn('.output-container .distribution-type-point-range input:eq(1)', '2.5');
  fillIn('.output-container .distribution-type-point-range input:eq(2)', '-0.5');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('You must specify a positive Increment'));
  });
});

test('selecting quantiles with incorrectly generated points is an error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #quantile');
  click('.distribution-point-options #generate-points');
  fillIn('.output-container .distribution-type-point-range input:eq(0)', '1.5');
  fillIn('.output-container .distribution-type-point-range input:eq(1)', '2.5');
  fillIn('.output-container .distribution-type-point-range input:eq(2)', '0.5');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('Quantiles requires that you specify a Start and End between 0 and 1'));
  });
});

test('selecting distributions without a field and no points show validation messages', function(assert) {
  assert.expect(4);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #quantile');
  click('.distribution-point-options #points');
  fillIn('.output-container .distribution-type-points input', '');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('A field needs to be selected first'));
    assert.ok(text.includes('You must specify a comma separated list of points for this option'));
  });
});

test('selecting distributions with bad points is a validation error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #cumulative');
  click('.distribution-point-options #points');
  fillIn('.output-container .distribution-type-points input', '1,2,a,foo,n');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('These are not valid points: a,foo,n'));
  });
});

test('selecting quantiles with bad points is a validation error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #distribution');
  click('.distribution-type-options #quantile');
  click('.distribution-point-options #points');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  fillIn('.output-container .distribution-type-points input', '0,0.2,1.5,-1');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('Quantiles requires points between 0 and 1. These are not: 1.5,-1'));
  });
});

test('selecting top k without fields is a validation error', function(assert) {
  assert.expect(3);

  visit('/queries/new');
  click('.output-options #top-k');
  click('.save-button');
  andThen(() => {
    assert.equal(find('.validation-container .simple-alert').length, 1);
    assert.equal(find('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    let text = find('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('A field needs to be selected first'));
  });
});

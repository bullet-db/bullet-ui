/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import setupForAcceptanceTest from '../helpers/setup-for-acceptance-test';
import { visit, click, fillIn } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import $ from 'jquery';

module('Acceptance | query validation', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('query showing filter validation messages', async function(assert) {
    assert.expect(2);
    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    await click('.save-button');

    assert.ok($('.filter-container .rules-list .rule-container').hasClass('has-error'));
    assert.equal($('.filter-container .rules-list .error-container').attr('data-original-title'), 'No filter selected');
  });

  test('query showing aggregation validation messages', async function(assert) {
    assert.expect(4);
    await visit('/queries/new');
    await fillIn('.options-container .aggregation-size input', '-1');
    await click('.submit-button');
    assert.equal($('.validation-container .alert-message > span').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').text().trim(),
      'Maximum results must be a positive integer');
    assert.equal($('.aggregation-size').siblings('.error-tooltip-link').length, 1);
  });

  test('query showing options validation messages', async function(assert) {
    assert.expect(4);
    await visit('/queries/new');
    await fillIn('.options-container .query-duration input', '-1');
    await click('.submit-button');
    assert.equal($('.validation-container .alert-message > span').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').text().trim(),
      'Duration must be a positive integer');
    assert.equal($('.query-duration').siblings('.error-tooltip-link').length, 1);
  });

  test('selecting count distinct without adding fields is an error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #count-distinct');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').text().trim(),
      'A field needs to be selected first');
  });

  test('selecting grouped data without adding fields or metrics is an error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #grouped-data');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').text().trim(),
      'If you are grouping data, you must add at least one Group Field and/or Metric Field');
  });

  test('query showing multiple error validation messages', async function(assert) {
    assert.expect(4);
    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await fillIn('.options-container .query-duration input', '-1');
    await click('.save-button');

    assert.equal($('.validation-container .alert-message > span').text(), 'OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('Duration must be a positive integer'));
    assert.ok(text.includes('No field selected'));
  });

  test('selecting distributions without a field and no number of points show validation messages', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await fillIn('.output-container .distribution-type-number-of-points input', '');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('A field needs to be selected first'));
    assert.ok(text.includes('You must specify the Number of Points you want to generate'));
  });

  test('selecting distributions with a non-positive number of points is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await fillIn('.output-container .distribution-type-number-of-points input', '-25');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('You must specify a positive Number of Points'));
  });

  test('selecting distributions with too many points is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await fillIn('.output-container .distribution-type-number-of-points input', '2500');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('The maintainer has set the maximum number of points you can generate to be 100'));
  });

  test('selecting distributions without a field and no generated points show validation messages', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await click('.distribution-point-options #generate-points');
    await fillIn($('.output-container .distribution-type-point-range input:eq(0)')[0], '');
    await fillIn($('.output-container .distribution-type-point-range input:eq(1)')[0], '');
    await fillIn($('.output-container .distribution-type-point-range input:eq(2)')[0], '');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('A field needs to be selected first'));
    assert.ok(text.includes('You must specify the Start, End and Increment for the points you want to generate'));
  });

  test('selecting distributions with incorrectly generated points is an error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await click('.distribution-point-options #generate-points');
    await fillIn($('.output-container .distribution-type-point-range input:eq(0)')[0], '0.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(1)')[0], '0.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(2)')[0], '0.05');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('You must specify Start less than End'));
  });

  test('selecting distributions with non positive increment is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #frequency');
    await click('.distribution-point-options #generate-points');
    await fillIn($('.output-container .distribution-type-point-range input:eq(0)')[0], '1.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(1)')[0], '2.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(2)')[0], '-0.5');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('You must specify a positive Increment'));
  });

  test('selecting quantiles with incorrectly generated points is an error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await click('.distribution-point-options #generate-points');
    await fillIn($('.output-container .distribution-type-point-range input:eq(0)')[0], '1.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(1)')[0], '2.5');
    await fillIn($('.output-container .distribution-type-point-range input:eq(2)')[0], '0.5');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('Quantiles requires that you specify a Start and End between 0 and 1'));
  });

  test('selecting distributions without a field and no points show validation messages', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await click('.distribution-point-options #points');
    await fillIn('.output-container .distribution-type-points input', '');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('A field needs to be selected first'));
    assert.ok(text.includes('You must specify a comma separated list of points for this option'));
  });

  test('selecting distributions with bad points is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #cumulative');
    await click('.distribution-point-options #points');
    await fillIn('.output-container .distribution-type-points input', '1,2,a,foo,n');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 2);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('These are not valid points: a,foo,n'));
  });

  test('selecting quantiles with bad points is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await click('.distribution-point-options #points');
    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
    await fillIn('.output-container .distribution-type-points input', '0,0.2,1.5,-1');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('Quantiles requires points between 0 and 1. These are not: 1.5,-1'));
  });

  test('selecting top k without fields is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #top-k');
    await click('.save-button');
    assert.equal($('.validation-container .simple-alert').length, 1);
    assert.equal($('.validation-container .simple-alert .alert-message .error-list li').length, 1);
    let text = $('.validation-container .simple-alert .alert-message .error-list li').text().trim();
    assert.ok(text.includes('A field needs to be selected first'));
  });
});

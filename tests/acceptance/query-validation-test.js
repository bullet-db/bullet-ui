/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import { setupForAcceptanceTest } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { visit, click, fillIn, find, findAll } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { findSiblings } from 'bullet-ui/tests/helpers/find-helpers';

module('Acceptance | query validation', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('query showing filter validation messages', async function(assert) {
    assert.expect(2);
    await visit('/queries/new');
    await click('.filter-container button[data-add=\'rule\']');
    await click('.save-button');
    assert.dom('.filter-container .rules-list .rule-container').hasClass('has-error');
    assert.dom('.filter-container .rules-list .error-container').hasAttribute('data-original-title', 'No filter selected');
  });

  test('query showing aggregation validation messages', async function(assert) {
    assert.expect(4);
    await visit('/queries/new');
    await fillIn('.options-container .aggregation-size input', '-1');
    await click('.submit-button');
    assert.dom('.validation-container .alert-message > span').hasText('OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').hasText('Maximum results must be a positive integer');
    assert.equal(findSiblings(find('.aggregation-size'), 'error-tooltip-link').length, 1);
  });

  test('query showing options validation messages', async function(assert) {
    assert.expect(4);
    await visit('/queries/new');
    await fillIn('.options-container .query-duration input', '-1');
    await click('.submit-button');
    assert.dom('.validation-container .alert-message > span').hasText('OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').hasText('Duration must be a positive integer');
    assert.equal(findSiblings(find('.query-duration'), 'error-tooltip-link').length, 1);
  });

  test('selecting count distinct without adding fields is an error', async function(assert) {
    assert.expect(3);
    await visit('/queries/new');
    await click('.output-options #count-distinct');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').hasText('Please fix the fields');
  });

  test('selecting grouped data without adding fields or metrics is an error', async function(assert) {
    assert.expect(3);
    await visit('/queries/new');
    await click('.output-options #grouped-data');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').hasText(
      'If you are grouping data, you must add at least one Group Field and/or Metric Field'
    );
  });

  test('query showing multiple error validation messages', async function(assert) {
    assert.expect(4);
    await visit('/queries/new');
    await click('.output-container .raw-sub-options #select');
    await fillIn('.options-container .query-duration input', '-1');
    await click('.save-button');
    assert.dom('.validation-container .alert-message > span').hasText('OOPS! PLEASE FIX ALL ERRORS TO PROCEED');
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.dom('.validation-container .simple-alert .alert-message .error-list').includesText('Duration must be a positive integer');
    assert.dom('.validation-container .simple-alert .alert-message .error-list').includesText('Please fix the fields');
  });

  test('selecting distributions without a field and no number of points show validation messages', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await fillIn('.output-container .distribution-type-number-of-points input', '');
    await click('.save-button');
    await this.pauseTest();
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.dom('.validation-container .simple-alert .alert-message .error-list').includesText('You must specify the Number of Points you want to generate');
    assert.dom('.validation-container .simple-alert .alert-message .error-list').includesText('Please fix the fields');
  });

  test('selecting distributions with a non-positive number of points is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await fillIn('.output-container .distribution-type-number-of-points input', '-25');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.ok(text.includes('You must specify a positive Number of Points'));
  });

  test('selecting distributions with too many points is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await fillIn('.output-container .distribution-type-number-of-points input', '2500');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.ok(text.includes('The maintainer has set the maximum number of points you can generate to be 100'));
  });

  test('selecting distributions without a field and no generated points show validation messages', async function(assert) {
    assert.expect(4);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await click('.distribution-point-options #generate-points');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.ok(text.includes('Please fix the fields'));
    assert.ok(text.includes('You must specify the Start, End and Increment for the points you want to generate'));
  });

  test('selecting distributions with incorrectly generated points is an error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await click('.distribution-point-options #generate-points');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '0.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '0.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '0.05');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.ok(text.includes('You must specify Start less than End'));
  });

  test('selecting distributions with non positive increment is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #frequency');
    await click('.distribution-point-options #generate-points');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '1.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '2.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '-0.5');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.ok(text.includes('You must specify a positive Increment'));
  });

  test('selecting quantiles with incorrectly generated points is an error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #distribution');
    await click('.distribution-type-options #quantile');
    await click('.distribution-point-options #generate-points');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[0], '1.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[1], '2.5');
    await fillIn(findAll('.output-container .distribution-type-point-range input')[2], '0.5');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
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
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.ok(text.includes('Please fix the fields'));
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
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 2 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
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
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 1 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.ok(text.includes('Quantiles requires points between 0 and 1. These are not: 1.5,-1'));
  });

  test('selecting top k without fields is a validation error', async function(assert) {
    assert.expect(3);

    await visit('/queries/new');
    await click('.output-options #top-k');
    await click('.save-button');
    assert.dom('.validation-container .simple-alert').exists({ count: 1 });
    assert.dom('.validation-container .simple-alert .alert-message .error-list li').exists({ count: 1 });
    let text = find('.validation-container .simple-alert .alert-message .error-list').textContent.trim();
    assert.ok(text.includes('Please fix the fields'));
  });
});

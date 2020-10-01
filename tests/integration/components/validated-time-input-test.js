/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { assertTooltipRendered } from 'ember-tooltips/test-support/dom';
import MockChangeset from 'bullet-ui/tests/helpers/mocked-changeset';

module('Integration | Component | validated time input', function(hooks) {
  setupRenderingTest(hooks);

  function mockChangeset(shouldError = () => false, fields = [{ name: 'bar', value: 15000 }],
                         error = { bar: { validation: ['Bar bad'] } }) {
    return new MockChangeset(fields, shouldError, error);
  }

  test('it renders a labeled input component and adjusts for time', async function(assert) {
    assert.expect(5);
    let changeset = mockChangeset();
    this.set('mockChangeset', changeset);
    this.set('mockOnChange', () => {
      assert.ok(true);
    });
    await render(hbs`
      <ValidatedTimeInput @changeset={{this.mockChangeset}} @valuePath='bar' @type='number' @label='label'
                          @onChange={{this.mockOnChange}}
      />
    `);
    assert.dom('label').hasText('label');
    assert.dom('input').hasValue('15');
    await fillIn('input', 30);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.deepEqual(changeset.modifications, [{ bar: 30000 }]);
  });

  test('it shows a validation error tooltip if there are errors', async function(assert) {
    assert.expect(5);
    let changeset = mockChangeset(() => true);
    this.set('mockChangeset', changeset);
    this.set('mockOnChange', () => {
      assert.ok(true);
    });
    await render(hbs`
      <ValidatedTimeInput @changeset={{this.mockChangeset}} @valuePath='bar' @type='number' @label='label'
                          @onChange={{this.mockOnChange}}
      />
    `);
    await fillIn('input', 30);
    assert.dom('.error-tooltip-link').exists({ count: 1 });
    await click('.error-tooltip-link');
    assertTooltipRendered(assert);
    assert.dom('.ember-tooltip p').hasText('Bar bad');
    assert.deepEqual(changeset.modifications, [{ bar: 30000 }]);
  });

  test('it does not validate on initialization but does when forced to', async function(assert) {
    let changeset = mockChangeset(() => true);
    this.set('mockChangeset', changeset);
    this.set('mockOnChange', () => { });
    this.set('mockForceValidate', false);
    await render(hbs`
      <ValidatedTimeInput @changeset={{this.mockChangeset}} @valuePath='bar' @type='number' @label='label'
                          @onChange={{this.mockOnChange}}
                          @forceValidate={{this.mockForceValidate}}
      />
    `);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('input').hasValue('15');
    this.set('mockForceValidate', true);
    await settled();
    assert.dom('.error-tooltip-link').exists({ count: 1 });
    await click('.error-tooltip-link');
    assertTooltipRendered(assert);
    assert.dom('.ember-tooltip p').hasText('Bar bad');

    this.set('mockChangeset', mockChangeset());
    this.set('mockForceValidate', false);
    await settled();
    assert.dom('.error-tooltip-link').doesNotExist();
    this.set('mockForceValidate', true);
    assert.dom('.error-tooltip-link').doesNotExist();
  });
});

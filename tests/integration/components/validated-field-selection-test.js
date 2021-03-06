/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectChoose } from 'ember-power-select/test-support/helpers'
import { assertTooltipRendered } from 'ember-tooltips/test-support/dom';
import { SUBFIELD_ENABLED_KEY } from 'bullet-ui/utils/builder-adapter';
import MockChangeset from 'bullet-ui/tests/helpers/mocked-changeset';

module('Integration | Component | validated field selection', function(hooks) {
  setupRenderingTest(hooks);

  const MOCK_COLUMNS = [
    { id: 'foo' },
    { id: 'bar' },
    { id: 'bar.*', [SUBFIELD_ENABLED_KEY]: true },
    { id: 'baz.qux' },
    { id: 'baz.norf' }
  ];

  function mockChangeset(shouldError = () => false,
                         fields = [{ name: 'field', value: 'foo' }, { name: 'name', value: null }],
                         error = { field: { validation: ['Field bad'] }, name: { validation:  ['Name bad'] } }) {
    return new MockChangeset(fields, shouldError, error);
  }

  test('it does not show a error tooltip if there are no errors', async function(assert) {
    let changeset = mockChangeset();
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => { });
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @onChange={{this.mockOnChange}}
                               @fieldClasses='custom-field' @nameClasses='custom-name'
      />
    `);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('.field-selection').hasClass('custom-field');
    assert.dom('.field-selection .ember-power-select-trigger').hasText('foo');
    await selectChoose('.field-selection', 'bar');
    assert.dom('.field-selection .ember-power-select-trigger').hasText('bar');
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('.field-name').hasClass('custom-name');
  });

  test('it shows a validation error tooltip for changes that makes the changeset invalid', async function(assert) {
    let changeset = mockChangeset(() => true);
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => { });
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @onChange={{this.mockOnChange}}
      />
    `);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('.field-selection .ember-power-select-trigger').hasText('foo');
    await selectChoose('.field-selection', 'bar');
    assert.dom('.field-selection .ember-power-select-trigger').hasText('bar');
    assert.dom('.error-tooltip-link').exists({ count: 1 });
    await click('.error-tooltip-link');
    assertTooltipRendered(assert);
    assert.dom('.ember-tooltip p').hasText('Field bad');
    await fillIn('.field-name input', 'newName');
    await click('.error-tooltip-link');
    assertTooltipRendered(assert);
    assert.dom('.ember-tooltip p').hasText('Name bad');
    assert.deepEqual(changeset.modifications, [{ field: 'bar' }, { name: '' }, { name: 'newName' }]);
  });

  test('it displays additional options if configured', async function(assert) {
    let changeset = mockChangeset(
      undefined,
      [{ name: 'field', value: 'foo' }, { name: 'name', value: null }, { name: 'type', value: 'A' }]
    );
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => { });
    this.set('mockAdditionalOptions', [ 'A', 'B', 'C'])
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @onChange={{this.mockOnChange}}
                               @enableAdditionalOptions={{true}} @additionalPath='type' @additionalLabel='Type Label'
                               @additionalClasses='type-selection' @additionalOptions={{this.mockAdditionalOptions}}
      />
    `);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('.field-selection .ember-power-select-trigger').hasText('foo');
    assert.dom('.additional-selection').hasClass('type-selection');
    assert.dom('.additional-selection .ember-power-select-trigger').hasText('A');
    assert.dom('.additional-selection label').hasText('Type Label');
    await selectChoose('.additional-selection', 'B');
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.deepEqual(changeset.modifications, [{ type: 'B' }]);
  });

  test('it can disable field selection', async function(assert) {
    let changeset = mockChangeset();
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => { });
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @disableField={{true}}
                               @onChange={{this.mockOnChange}}
      />
    `);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('.field-selection').doesNotExist();
    assert.dom('.field-name').exists({ count:  1 });
    assert.dom('.delete-button').exists({ count:  1 });
  });

  test('it can disable renaming', async function(assert) {
    let changeset = mockChangeset();
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => { });
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @enableRenaming={{false}}
                               @onChange={{this.mockOnChange}}
      />
    `);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('.field-selection').exists({ count:  1 });
    assert.dom('.field-name').doesNotExist();
    assert.dom('.delete-button').exists({ count:  1 });
  });

  test('it can disable deleting', async function(assert) {
    let changeset = mockChangeset();
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => { });
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @enableDeleting={{false}}
                               @onChange={{this.mockOnChange}}
      />
    `);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('.field-selection').exists({ count:  1 });
    assert.dom('.field-name').exists({ count:  1 });
    assert.dom('.delete-button').doesNotExist();
  });

  test('it calls the onChange hook when changing any field', async function(assert) {
    assert.expect(5);
    let changeset = mockChangeset();
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => {
      assert.ok(true)
    });
    this.set('mockAdditionalOptions', [ 'A', 'B', 'C'])
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @onChange={{this.mockOnChange}}
                               @enableAdditionalOptions={{true}} @additionalPath='type' @additionalLabel='Type Label'
                               @additionalOptions={{this.mockAdditionalOptions}}
      />
    `);
    await selectChoose('.additional-selection', 'B');
    await selectChoose('.field-selection', 'bar');
    await fillIn('.field-name input', 'newName');
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.deepEqual(changeset.modifications, [{ type: 'B' }, { field: 'bar' }, { name: '' }, { name: 'newName' }]);
  });

  test('it calls the onDelete hook when deleting', async function(assert) {
    assert.expect(2);
    let changeset = mockChangeset();
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => { });
    this.set('mockOnDelete', () => {
      assert.ok(true);
    });
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @onChange={{this.mockOnChange}}
                               @onDelete={{this.mockOnDelete}}
      />
    `);
    assert.dom('.delete-button').exists({ count:  1 });
    await click('.delete-button');
  });

  test('it does not validate on initialization but does when forced to', async function(assert) {
    let changeset = mockChangeset(
      () => true,
      [{ name: 'field', value: 'foo' }, { name: 'name', value: null }, { name: 'type', value: 'A' }],
      { field: { validation: ['Field bad'] }, name: { validation:  ['Name bad'] }, type: { validation: ['Type bad'] } }
    );
    this.set('mockChangeset', changeset);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('mockOnChange', () => { });
    this.set('mockAdditionalOptions', [ 'A', 'B', 'C'])
    this.set('mockForceValidate', false);
    await render(hbs`
      <ValidatedFieldSelection @columns={{this.mockColumns}} @changeset={{this.mockChangeset}}
                               @onChange={{this.mockOnChange}}
                               @forceValidate={{this.mockForceValidate}}
                               @enableAdditionalOptions={{true}} @additionalPath='type' @additionalLabel='Type Label'
                               @additionalOptions={{this.mockAdditionalOptions}}
      />
    `);
    assert.dom('.error-tooltip-link').doesNotExist();
    assert.dom('.field-selection .ember-power-select-trigger').hasText('foo');
    assert.dom('.additional-selection .ember-power-select-trigger').hasText('A');
    this.set('mockForceValidate', true);
    await settled();
    assert.dom('.field-selection .ember-power-select-trigger').hasText('foo');
    assert.dom('.error-tooltip-link').exists({ count: 1 });
    await click('.error-tooltip-link');
    assertTooltipRendered(assert);
    assert.dom('.ember-tooltip').hasText('Type bad Field bad Name bad');

    this.set('mockChangeset', mockChangeset());
    this.set('mockForceValidate', false);
    await settled();
    assert.dom('.error-tooltip-link').doesNotExist();
    this.set('mockForceValidate', true);
    assert.dom('.error-tooltip-link').doesNotExist();
  });
});

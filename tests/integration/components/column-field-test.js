/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const MOCK_COLUMNS = [
  { id: 'foo' },
  { id: 'bar' },
  { id: 'bar.*', hasFreeformField: true },
  { id: 'baz.qux' },
  { id: 'baz.norf' }
];

module('Integration | Component | column field', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<ColumnField/>`);

    // There is at least this label
    assert.dom(this.element).hasText('Field');

    await render(hbs`<ColumnField>template block text</ColumnField>`);
    // It is not meant to be used in block form
    assert.dom(this.element).hasText('Field');
  });

  test('it only takes in an initial value if it does not already have one', async function(assert) {
    this.set('field', 'foo');
    this.set('mockColumns', MOCK_COLUMNS);
    await render(
      hbs`<ColumnField @columns={{this.mockColumns}} @subfieldSeperator='.'
                       @subfieldSuffix='.*' @initialValue={{this.field}}/>`
    );
    assert.dom('.column-onlyfield .ember-power-select-selected-item').hasText('foo');
    this.set('field', 'bar');
    assert.dom('.column-onlyfield .ember-power-select-selected-item').hasText('foo');
  });

  test('it shows a subfield for a composite field', async function(assert) {
    this.set('mockColumns', MOCK_COLUMNS);
    await render(
      hbs`<ColumnField @columns={{this.mockColumns}} @initialValue='bar.subfield' @subfieldKey='hasFreeformField'
                       @subfieldSuffix='.*' @subfieldSeparator='.'/>`);
    assert.dom('.column-mainfield .ember-power-select-trigger').hasText('bar.*');
    assert.dom('.column-subfield input').exists({ count: 1 });
    assert.dom('.column-subfield input').hasValue('subfield');
  });

  test('it calls the onDone action with the new field when the subfield loses focus', async function(assert) {
    assert.expect(3);

    this.set('mockColumns', MOCK_COLUMNS);
    this.set('doneHandler', field => {
      assert.equal(field, 'bar.foo');
    });
    await render(
      hbs`<ColumnField @columns={{this.mockColumns}} @initialValue='bar.baz' @subfieldKey='hasFreeformField'
                       @subfieldSuffix='.*' @subfieldSeparator='.' @onDone={{this.doneHandler}}/>`
    );
    await fillIn('.column-subfield input', 'foo');
    assert.dom('.column-mainfield .ember-power-select-trigger').hasText('bar.*');
    assert.dom('.column-subfield input').hasValue('foo');
  });
});

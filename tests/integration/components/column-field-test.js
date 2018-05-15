/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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
    await render(hbs`{{column-field}}`);

    // There is at least this label
    assert.equal(this.element.textContent.trim(), 'Field');

    // Template block usage:"
    await render(hbs`
      {{#column-field}}
        template block text
      {{/column-field}}
    `);

    // It is not meant to be used in block form
    assert.equal(this.element.textContent.trim(), 'Field');
  });

  test('it only takes in an initial value if it does not already have one', async function(assert) {
    this.set('field', 'foo');
    this.set('mockColumns', MOCK_COLUMNS);
    await render(
      hbs`{{column-field columns=mockColumns subfieldSeperator='.' subfieldSuffix='.*' initialValue=field}}`
    );
    assert.equal(this.element.querySelector('.column-onlyfield .ember-power-select-selected-item').textContent.trim(), 'foo');
    this.set('field', 'bar');
    assert.equal(this.element.querySelector('.column-onlyfield .ember-power-select-selected-item').textContent.trim(), 'foo');
  });

  test('it shows a subfield for a composite field', async function(assert) {
    this.set('selected', { id: 'baz', hasFreeformField: true });
    await render(hbs`{{column-field selectedColumn=selected subfieldKey='hasFreeformField' initialValue=field}}`);
    assert.equal(this.element.querySelector('.column-mainfield .ember-power-select-trigger').textContent.trim(), 'baz');
    assert.ok(this.element.querySelectorAll('.column-subfield input').length, 1);
  });

  test('it sets the subfield for a composite field', async function(assert) {
    this.set('selected', { id: 'baz', hasFreeformField: true });
    this.set('sub', 'foo');
    await render(hbs`{{column-field selectedColumn=selected subfieldKey='hasFreeformField' subfield=sub}}`);
    assert.equal(this.element.querySelector('.column-mainfield .ember-power-select-trigger').textContent.trim(), 'baz');
    assert.equal(this.element.querySelector('.column-subfield input').value, 'foo');
  });

  test('it calls the onDone action with the new field when the subfield loses focus', async function(assert) {
    assert.expect(3);

    this.set('mockColumns', MOCK_COLUMNS);
    this.set('doneHandler', field => {
      assert.equal(field, 'bar.foo');
    });
    await render(
      hbs`{{column-field columns=mockColumns initialValue='bar.baz' subfieldKey='hasFreeformField' subfieldSuffix='.*' subfieldSeparator='.' onDone=(action doneHandler)}}`
    );
    this.element.querySelector('.column-subfield input').value = 'foo';
    assert.equal(this.element.querySelector('.column-mainfield .ember-power-select-trigger').textContent.trim(), 'bar.*');
    assert.equal(this.element.querySelector('.column-subfield input').value, 'foo');
    await triggerEvent('.column-subfield input', 'blur');
  });
});

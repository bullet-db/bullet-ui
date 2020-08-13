/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | labeled input', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders and yields nothing', async function(assert) {
    await render(hbs`<LabeledInput/>`);
    assert.dom(this.element).hasText('');

    await render(hbs`<LabeledInput>template block text</LabeledInput>`);
    assert.dom(this.element).hasText('');
  });

  test('it has a label', async function(assert) {
    await render(hbs`<LabeledInput @label='foo'/>`);
    assert.dom('label').exists({ count: 1 });
    assert.dom('label').includesText('foo');
  });

  test('it has an input with the given value', async function(assert) {
    await render(hbs`<LabeledInput @label='foo' @value='bar'/>`);
    assert.dom('input').hasValue('bar');
    assert.dom('input').hasAttribute('type', 'text');
  });

  test('it has a default class on input', async function(assert) {
    await render(hbs`<LabeledInput/>`);
    assert.dom('input').hasClass('form-control');
  });

  test('it has a label that points to the input', async function(assert) {
    await render(hbs`<LabeledInput @label='foo' @value='bar'/>`);
    let labelFor = this.element.querySelector('label').getAttribute('for');
    let inputId = this.element.querySelector('input').getAttribute('id');
    assert.equal(labelFor, inputId, 'Label should target the input');
  });

  test('it has calls the provided action with the changed value on input', async function(assert) {
    assert.expect(1);
    this.set('changeHandler', value => {
      assert.equal(value, 'foo');
    });
    await render(hbs`<LabeledInput @label='foo' @value='bar' @onChange={{this.changeHandler}}/>`);
    await fillIn('.labeled-input input', 'foo');
  });
});

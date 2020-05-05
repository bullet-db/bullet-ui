/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | labeled input', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders and yields nothing', async function(assert) {
    await render(hbs`{{labeled-input}}`);
    assert.dom(this.element).hasText('');

    await render(hbs`
      {{#labeled-input}}
        template block text
      {{/labeled-input}}
    `);
    assert.dom(this.element).hasText('');
  });

  test('it has text input type', async function(assert) {
    await render(hbs`{{labeled-input}}`);
    assert.equal(this.element.querySelectorAll('input').length, 1);
    assert.equal(this.element.querySelector('input').getAttribute('type'), 'text');
  });

  test('it has a default class on input', async function(assert) {
    await render(hbs`{{labeled-input}}`);
    let classes = new Set(this.element.querySelector('input').getAttribute('class').split(/\s+/));
    assert.ok(classes.has('form-control'));
  });

  test('it has a label', async function(assert) {
    await render(hbs`{{labeled-input}}`);
    assert.equal(this.element.querySelectorAll('label').length, 1);
  });

  test('it has a label that points to the input', async function(assert) {
    await render(hbs`{{labeled-input}}`);
    let labelFor = this.element.querySelector('label').getAttribute('for');
    let inputId = this.element.querySelector('input').getAttribute('id');
    assert.equal(labelFor, inputId, 'Label should target the input');
  });

  test('it sets a field name and value', async function(assert) {
    await render(hbs`{{labeled-input fieldName='foo' fieldValue='bar'}}`);
    assert.equal(this.element.querySelector('label').innerHTML, 'foo');
    assert.equal(this.element.querySelector('input').value, 'bar');
  });
});

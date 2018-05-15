/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | simple alert', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a message in block form', async function(assert) {
    await render(hbs`{{simple-alert}}`);
    assert.equal(this.element.textContent.trim(), '');

    await render(hbs`
      {{#simple-alert}}
        template block text
      {{/simple-alert}}
    `);
    assert.equal(this.element.textContent.trim(), 'template block text');
  });

  test('it shows a dismiss button', async function(assert) {
    await render(hbs`{{simple-alert}}`);
    assert.ok(this.element.querySelector('.alert > button i').classList.contains('glyphicon-remove'));
  });

  test('it maps an empty alert type to the proper bootstrap css class', async function(assert) {
    await render(hbs`{{simple-alert}}`);
    assert.equal(this.element.querySelector('.alert').getAttribute('class'), 'alert  alert-dismissible');
  });

  test('it maps an warning alert type to the proper bootstrap css class', async function(assert) {
    await render(hbs`{{simple-alert type='warning'}}`);
    assert.ok(this.element.querySelector('.alert').getAttribute('class').indexOf('alert-warning') >= 0);
  });

  test('it maps an error alert type to the proper bootstrap css class', async function(assert) {
    await render(hbs`{{simple-alert type='error'}}`);
    assert.ok(this.element.querySelector('.alert').getAttribute('class').indexOf('alert-danger') >= 0);
  });

  test('it maps a success alert type to the proper bootstrap css class', async function(assert) {
    await render(hbs`{{simple-alert type='success'}}`);
    assert.ok(this.element.querySelector('.alert').getAttribute('class').indexOf('alert-success') >= 0);
  });
});

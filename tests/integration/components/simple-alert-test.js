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
    assert.equal(this.$().text().trim(), '');

    await render(hbs`
      {{#simple-alert}}
        template block text
      {{/simple-alert}}
    `);
    assert.equal(this.$().text().trim(), 'template block text');
  });

  test('it shows a dismiss button', async function(assert) {
    await render(hbs`{{simple-alert}}`);
    assert.ok(this.$('.alert > button i').hasClass('glyphicon-remove'));
  });

  test('it maps an empty alert type to the proper bootstrap css class', async function(assert) {
    await render(hbs`{{simple-alert}}`);
    assert.equal(this.$('.alert').prop('class'), 'alert  alert-dismissible');
  });

  test('it maps an warning alert type to the proper bootstrap css class', async function(assert) {
    await render(hbs`{{simple-alert type='warning'}}`);
    assert.ok(this.$('.alert').prop('class').indexOf('alert-warning') >= 0);
  });

  test('it maps an error alert type to the proper bootstrap css class', async function(assert) {
    await render(hbs`{{simple-alert type='error'}}`);
    assert.ok(this.$('.alert').prop('class').indexOf('alert-danger') >= 0);
  });

  test('it maps a success alert type to the proper bootstrap css class', async function(assert) {
    await render(hbs`{{simple-alert type='success'}}`);
    assert.ok(this.$('.alert').prop('class').indexOf('alert-success') >= 0);
  });
});

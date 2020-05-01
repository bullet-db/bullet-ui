/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | mode toggle', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders two modes with the on view toggled by default', async function(assert) {
    await render(hbs`{{mode-toggle}}`);
    assert.equal(this.element.querySelectorAll('.mode').length, 2);
    await render(hbs`
      {{#mode-toggle}}
        template block text
      {{/mode-toggle}}
    `);
    assert.equal(this.element.querySelectorAll('.mode').length, 2);
    // You show the off-view when you're on
    assert.ok(this.element.querySelector('.on-view').hasAttribute('hidden'));
    assert.notOk(this.element.querySelector('.off-view').hasAttribute('hidden'));
  });

  test('it allows you to toggle modes', async function(assert) {
    assert.expect(5);
    this.set('mockToggled', isToggled => {
      assert.notOk(isToggled);
    });
    await render(hbs`{{mode-toggle onToggled=mockToggled}}`);
    assert.ok(this.element.querySelector('.on-view').hasAttribute('hidden'));
    assert.notOk(this.element.querySelector('.off-view').hasAttribute('hidden'));
    await click('.off-view');
    assert.ok(this.element.querySelector('.off-view').hasAttribute('hidden'));
    assert.notOk(this.element.querySelector('.on-view').hasAttribute('hidden'));
  });
});

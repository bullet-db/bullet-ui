/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | mode toggle', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders two buttons with texts', async function(assert) {
    await render(hbs`{{mode-toggle}}`);
    assert.equal(this.element.textContent.trim(), 'Toggled\n Not Toggled');
    assert.equal(this.element.querySelectorAll('button').length, 2);
    await render(hbs`
      {{#mode-toggle}}
        template block text
      {{/mode-toggle}}
    `);
    assert.equal(this.element.textContent.trim(), 'Toggled\n Not Toggled');
    assert.equal(this.element.querySelectorAll('button').length, 2);
    assert.ok(this.element.querySelector('.left-view').classList.contains('selected'));
  });

  test('it renders two buttons with provided texts', async function(assert) {
    await render(hbs`{{mode-toggle toggledText="Foo" notToggledText="Bar"}}`);
    assert.equal(this.element.textContent.trim(), 'Foo\n Bar');
    assert.equal(this.element.querySelectorAll('button').length, 2);
  });

  test('it allows you to toggle modes', async function(assert) {
    assert.expect(4);
    this.set('mockToggled', isToggled => {
      assert.notOk(isToggled);
    });
    await render(hbs`{{mode-toggle onToggled=mockToggled}}`);
    assert.ok(this.element.querySelector('.left-view').classList.contains('selected'));
    await click('.right-view');
    assert.notOk(this.element.querySelector('.left-view').classList.contains('selected'));
    assert.ok(this.element.querySelector('.right-view').classList.contains('selected'));
  });
});

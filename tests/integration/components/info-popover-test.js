/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | info popover', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{info-popover}}`);
    assert.ok(this.element.querySelector('.info-popover-link').classList.contains('fa-info-circle'));
    assert.equal(this.element.textContent.trim(), '');
    await render(hbs`
      {{#info-popover}}
        template block text
      {{/info-popover}}
    `);
    assert.ok(this.element.querySelector('.info-popover-link').classList.contains('fa-info-circle'));
    assert.equal(this.element.textContent.trim(), 'template block text');
  });

  test('it can behave as a link', async function(assert) {
    this.set('asButton', false);
    this.set('mockText', 'foo');
    await render(hbs`{{info-popover isButton=asButton additionalText=mockText}}`);
    assert.notOk(this.element.querySelector('.info-popover-link').classList.contains('fa-info-circle'));
    assert.equal(this.element.querySelector('.info-link-text').textContent.trim(), 'foo');
  });

  test('it hides the initial contents', async function(assert) {
    await render(hbs`
      {{#info-popover}}
        <p>Test content</p>
      {{/info-popover}}
    `);
    assert.ok(this.element.querySelector('.popover-contents').classList.contains('hidden'));
    assert.ok(this.element.querySelector('p').parentElement.classList.contains('hidden'));
  });

  test('it allows customizing the title', async function(assert) {
    await render(hbs`
      {{#info-popover id="test-info-popover" title="Test title"}}
        <p>Test content</p>
      {{/info-popover}}
    `);
    assert.equal(this.element.querySelector('.popover-title').textContent.trim(), 'Test title');
  });
});

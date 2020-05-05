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
    assert.dom(this.element.querySelector('.info-popover-link')).hasClass('fa-info-circle');
    assert.dom(this.element).hasText('');
    await render(hbs`
      {{#info-popover}}
        template block text
      {{/info-popover}}
    `);
    assert.dom(this.element.querySelector('.info-popover-link')).hasClass('fa-info-circle');
    assert.dom(this.element).hasText('template block text');
  });

  test('it can behave as a link', async function(assert) {
    this.set('asButton', false);
    this.set('mockText', 'foo');
    await render(hbs`{{info-popover isButton=asButton additionalText=mockText}}`);
    assert.dom(this.element.querySelector('.info-popover-link')).hasNoClass('fa-info-circle');
    assert.dom(this.element.querySelector('.info-link-text')).hasText('foo');
  });

  test('it hides the initial contents', async function(assert) {
    await render(hbs`
      {{#info-popover}}
        <p>Test content</p>
      {{/info-popover}}
    `);
    assert.dom(this.element.querySelector('.popover-contents')).hasClass('hidden');
    assert.dom(this.element.querySelector('p').parentElement).hasClass('hidden');
  });

  test('it allows customizing the title', async function(assert) {
    await render(hbs`
      {{#info-popover id="test-info-popover" title="Test title"}}
        <p>Test content</p>
      {{/info-popover}}
    `);
    assert.dom(this.element.querySelector('.popover-title')).hasText('Test title');
  });
});

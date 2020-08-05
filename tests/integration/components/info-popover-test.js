/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { assertTooltipNotRendered, assertTooltipRendered } from 'ember-tooltips/test-support/dom';

module('Integration | Component | info popover', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders and shows text in block mode', async function(assert) {
    await render(hbs`<InfoPopover/>`);
    assert.dom('.info-popover-link').hasClass('fa-info-circle');
    assert.dom(this.element).hasText('');
    assertTooltipNotRendered(assert);
    await render(hbs`<InfoPopover>template block text</InfoPopover>`);
    assert.dom('.info-popover-link').hasClass('fa-info-circle');
    assertTooltipNotRendered(assert);
    await click('a');
    assertTooltipRendered(assert);
    assert.dom(this.element).hasText('template block text');
  });

  test('it can behave as a link', async function(assert) {
    await render(hbs`<InfoPopover @isButton={{false}} @additionalText='foo'/>`);
    assert.dom('.info-popover-link').hasNoClass('fa-info-circle');
    assert.dom('.info-link-text').hasText('foo');
  });

  test('it allows customizing the title', async function(assert) {
    await render(hbs`
      <InfoPopover @title='Test title'>
        <p>Test content</p>
      </InfoPopover>
    `);
    await click('a');
    assertTooltipRendered(assert);
    assert.dom('.info-popover-title').hasText('Test title');
  });

  test('it allows customizing the body', async function(assert) {
    await render(hbs`
      <InfoPopover>
        <p>Test content</p>
      </InfoPopover>
    `);
    await click('a');
    assertTooltipRendered(assert);
    assert.dom('.info-popover-content p').hasText('Test content');
  });
});

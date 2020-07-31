/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { assertTooltipNotRendered, assertTooltipRendered, findTooltip } from 'ember-tooltips/test-support/dom';

module('Integration | Component | Cell | record entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a simple text value', async function(assert) {
    this.set('mockRow', { content: { value: 'foo' } });
    this.set('mockColumn', { label: 'value' });
    await render(hbs`<Cells::RecordEntry @row={{this.mockRow}} @column={{this.mockColumn}}/>`);
    assert.dom(this.element).hasText('foo');
    assert.dom('.record-popover-body').doesNotExist();
  });

  test('it renders a complex array as text', async function(assert) {
    this.set('mockRow', { content: { bar: ['foo'] } });
    this.set('mockColumn', { label: 'bar' });
    await render(hbs`<Cells::RecordEntry @row={{this.mockRow}} @column={{this.mockColumn}}/>`);
    assert.dom('.plain-entry').hasText('["foo"]');
  });

  test('it adds a popover on click', async function(assert) {
    assert.expect(3);
    this.set('mockRow', { content: { bar: ['foo'] } });
    this.set('mockColumn', { label: 'bar' });
    await render(hbs`<Cells::RecordEntry @row={{this.mockRow}} @column={{this.mockColumn}}/>`);
    assertTooltipNotRendered(assert);
    await click('.record-entry');
    assertTooltipRendered(assert);
    let tooltip = findTooltip();
    assert.ok(tooltip.innerText.trim().indexOf('bar') !== -1);
  });
});

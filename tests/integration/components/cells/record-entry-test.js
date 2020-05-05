/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Cell | record entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a simple text value', async function(assert) {
    this.set('mockRow', { content: { value: 'foo' } });
    this.set('mockColumn', { label: 'value' });
    await render(hbs`{{cells/record-entry row=mockRow column=mockColumn}}`);
    assert.ok(this.element.textContent, 'foo');
    assert.equal(this.element.querySelectorAll('.record-popover-body').length, 0);
  });

  test('it renders a complex array as text', async function(assert) {
    this.set('mockRow', { content: { bar: ['foo'] } });
    this.set('mockColumn', { label: 'bar' });
    await render(hbs`{{cells/record-entry row=mockRow column=mockColumn}}`);
    assert.dom(this.element.querySelector('.plain-entry')).hasText('["foo"]');
  });

  test('it adds the popover to the provided element selector on click', async function(assert) {
    assert.expect(3);
    this.set('mockRow', { content: { bar: ['foo'] } });
    this.set('mockColumn', { label: 'bar' });
    await render(
      hbs`{{cells/record-entry id="test-record-entry" row=mockRow column=mockColumn createPopoverOn="#test-record-entry"}}`
    );
    assert.equal(this.element.querySelectorAll('.record-popover-title').length, 0);
    await click('#test-record-entry');
    return settled().then(() => {
      assert.equal(this.element.querySelectorAll('.record-popover-title').length, 1);
      assert.dom(this.element.querySelector('.record-popover-title > span')).hasText('bar');
    });
  });
});

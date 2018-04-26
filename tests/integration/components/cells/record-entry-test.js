/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Cell | record entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a simple text value', async function(assert) {
    this.set('mockRow', { content: { value: 'foo' } });
    this.set('mockColumn', { label: 'value' });
    await render(hbs`{{cells/record-entry row=mockRow column=mockColumn}}`);
    assert.ok(this.$().text(), 'foo');
    assert.equal(this.$('.record-popover-body').length, 0);
  });

  test('it renders a complex array as text', async function(assert) {
    this.set('mockRow', { content: { bar: ['foo'] } });
    this.set('mockColumn', { label: 'bar' });
    await render(hbs`{{cells/record-entry row=mockRow column=mockColumn}}`);
    assert.equal(this.$('.plain-entry').text(), '["foo"]');
  });

  test('it adds the popover to the provided element selector on click', async function(assert) {
    assert.expect(3);
    this.set('mockRow', { content: { bar: ['foo'] } });
    this.set('mockColumn', { label: 'bar' });
    await render(
      hbs`{{cells/record-entry id="test-record-entry" row=mockRow column=mockColumn createPopoverOn="#test-record-entry"}}`
    );
    assert.equal(this.$('.record-popover-title').length, 0);
    this.$('#test-record-entry').click();
    return settled().then(() => {
      assert.equal(this.$('.record-popover-title').length, 1);
      assert.equal(this.$('.record-popover-title > span').text(), 'bar');
    });
  });
});

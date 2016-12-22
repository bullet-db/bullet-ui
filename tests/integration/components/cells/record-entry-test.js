/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('record-entry', 'Integration | Component | Cell | record entry', {
  integration: true
});

test('it displays a simple text value', function(assert) {
  this.set('mockRow', { content: { value: 'foo' } });
  this.set('mockColumn', { label: 'value' });
  this.render(hbs`{{cells/record-entry row=mockRow column=mockColumn}}`);
  assert.ok(this.$().text(), 'foo');
  assert.equal(this.$('.record-popover-body').length, 0);
});

test('it renders a complex array as text', function(assert) {
  this.set('mockRow', { content: { bar: ['foo'] } });
  this.set('mockColumn', { label: 'bar' });
  this.render(hbs`{{cells/record-entry row=mockRow column=mockColumn}}`);
  assert.equal(this.$('.plain-entry').text(), '["foo"]');
});

test('it adds the popover to the provided element selector on click', function(assert) {
  assert.expect(3);
  this.set('mockRow', { content: { bar: ['foo'] } });
  this.set('mockColumn', { label: 'bar' });
  this.render(hbs`{{cells/record-entry id="test-record-entry" row=mockRow column=mockColumn createPopoverOn="#test-record-entry"}}`);
  assert.equal(this.$('.record-popover-title').length, 0);
  this.$('#test-record-entry').click();
  return wait().then(() => {
    assert.equal(this.$('.record-popover-title').length, 1);
    assert.equal(this.$('.record-popover-title > span').text(), 'bar');
  });
});

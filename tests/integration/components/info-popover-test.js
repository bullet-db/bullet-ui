/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('info-popover', 'Integration | Component | info popover', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{info-popover}}`);
  assert.ok(this.$('.info-popover-link').hasClass('glyphicon-info-sign'));
  assert.equal(this.$().text().trim(), '');
  this.render(hbs`
    {{#info-popover}}
      template block text
    {{/info-popover}}
  `);
  assert.ok(this.$('.info-popover-link').hasClass('glyphicon-info-sign'));
  assert.equal(this.$().text().trim(), 'template block text');
});

test('it can behave as a link', function(assert) {
  this.set('asButton', false);
  this.set('mockText', 'foo');
  this.render(hbs`{{info-popover isButton=asButton additionalText=mockText}}`);
  assert.notOk(this.$('.info-popover-link').hasClass('glyphicon-info-sign'));
  assert.equal(this.$('.info-link-text').text().trim(), 'foo');
});

test('it hides the initial contents', function(assert) {
  this.render(hbs`
    {{#info-popover}}
      <p>Test content</p>
    {{/info-popover}}
  `);
  assert.ok(this.$('.popover-contents').hasClass('hidden'));
  assert.ok(this.$('p').parent().hasClass('hidden'));
});

test('it allows customizing the title', function(assert) {
  this.render(hbs`
    {{#info-popover id="test-info-popover" title="Test title"}}
      <p>Test content</p>
    {{/info-popover}}
  `);
  assert.equal(this.$('.popover-title').text().trim(), 'Test title');
});

/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('query-shareable-link', 'Integration | Component | query shareable link', {
  integration: true
});

test('it displays an input with the query id and query link as contents', function(assert) {
  let row = Ember.Object.create({ content: { id: 'foo' }, queryLink: '/bar/as3FDS3dx' });
  this.set('mockRow', row);

  this.render(hbs`{{query-shareable-link row=mockRow}}`);

  assert.equal(this.$('input').length, 1);
  assert.equal(this.$('input').attr('id'), 'query-foo');
  assert.equal(this.$('input').val(), '/bar/as3FDS3dx');
  assert.equal(this.$('i.collapse-icon').length, 1);
});

test('it displays an button that points to the input for clipboard copying', function(assert) {
  let row = Ember.Object.create({ content: { id: 'foo' }, queryLink: '/bar/as3FDS3dx' });
  this.set('mockRow', row);

  this.render(hbs`{{query-shareable-link row=mockRow}}`);

  assert.equal(this.$('button.copy-btn').length, 1);
  assert.equal(this.$('button.copy-btn').data('clipboard-target'), '#query-foo');
  assert.equal(this.$('button.copy-btn .copy-icon').length, 1);
});

test('it unsets the expanded property when the collapse icon is clicked', function(assert) {
  let row = Ember.Object.create({ content: { id: 'foo' }, expanded: true, queryLink: '/bar/as3FDS3dx' });
  this.set('mockRow', row);

  this.render(hbs`{{query-shareable-link row=mockRow}}`);

  assert.ok(this.get('mockRow.expanded'));
  this.$('.collapse-icon').click();
  return wait().then(() => {
    assert.notOk(this.get('mockRow.expanded'));
  });
});

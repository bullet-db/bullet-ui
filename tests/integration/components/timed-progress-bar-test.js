/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('timed-progress-bar', 'Integration | Component | timed progress bar', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{timed-progress-bar}}`);
  assert.equal(this.$().text().trim(), '0%');

  this.render(hbs`
    {{#timed-progress-bar}}
      template block text
    {{/timed-progress-bar}}
  `);
  assert.ok(this.$().text().trim().match('0%\\s+template block text'));
});

test('it starts as inactive', function(assert) {
  this.render(hbs`{{timed-progress-bar}}`);
  assert.ok(this.$('.progress').prop('class').indexOf('hidden') !== -1);
});

test('it can be made active', function(assert) {
  this.set('isActive', false);
  this.render(hbs`{{timed-progress-bar active=isActive}}`);
  assert.ok(this.$('.progress').prop('class').indexOf('hidden') !== -1);
  this.set('isActive', true);
  assert.ok(this.$('.progress').prop('class').indexOf('hidden') === -1);
});

test('it changes from percentage to a message when done', function(assert) {
  assert.expect(1);
  this.render(hbs`{{timed-progress-bar active=true duration=100}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim(), 'Collecting results...');
  });
});

test('it calls the finished action', function(assert) {
  assert.expect(1);
  this.set('finishedAction', () => {
    assert.ok(true, 'finished was called');
  });
  this.render(hbs`{{timed-progress-bar active=true duration=100 finished=(action finishedAction)}}`);
  return wait();
});

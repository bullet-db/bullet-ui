/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('labeled-input', 'Integration | Component | labeled input', {
  integration: true
});

test('it renders and yields nothing', function(assert) {
  this.render(hbs`{{labeled-input}}`);
  assert.equal(this.$().text().trim(), '');

  this.render(hbs`
    {{#labeled-input}}
      template block text
    {{/labeled-input}}
  `);
  assert.equal(this.$().text().trim(), '');
});

test('it has text input type', function(assert) {
  this.render(hbs`{{labeled-input}}`);
  assert.equal(this.$('input').length, 1);
  assert.equal(this.$('input').prop('type'), 'text');
});

test('it has a default class on input', function(assert) {
  this.render(hbs`{{labeled-input}}`);
  let classes = new Set(this.$('input').prop('class').split(/\s+/));
  assert.ok(classes.has('form-control'));
});

test('it has a label', function(assert) {
  this.render(hbs`{{labeled-input}}`);
  assert.equal(this.$('label').length, 1);
});

test('it has a label that points to the input', function(assert) {
  this.render(hbs`{{labeled-input}}`);
  let labelFor = this.$('label').prop('for');
  let inputId = this.$('input').prop('id');
  assert.equal(labelFor, inputId, 'Label should target the input');
});

test('it sets a field name and value', function(assert) {
  this.render(hbs`{{labeled-input fieldName='foo' fieldValue='bar'}}`);
  assert.equal(this.$('label').html(), 'foo');
  assert.equal(this.$('input').val(), 'bar');
});

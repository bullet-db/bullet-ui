/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const MOCK_COLUMNS = [
  { id: 'foo' },
  { id: 'bar' },
  { id: 'bar.*', hasFreeformField: true },
  { id: 'baz.qux' },
  { id: 'baz.norf' }
];

moduleForComponent('column-field', 'Integration | Component | column field', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{column-field}}`);

  // There is at least this label
  assert.equal(this.$().text().trim(), 'Field');

  // Template block usage:"
  this.render(hbs`
    {{#column-field}}
      template block text
    {{/column-field}}
  `);

  // It is not meant to be used in block form
  assert.equal(this.$().text().trim(), 'Field');
});

test('it only takes in an initial value if it does not already have one', function(assert) {
  this.set('field', 'foo');
  this.set('mockColumns', MOCK_COLUMNS);
  this.render(hbs`{{column-field columns=mockColumns subfieldSeperator='.' subfieldSuffix='.*' initialValue=field}}`);
  assert.equal(this.$('.column-onlyfield .ember-power-select-selected-item').text().trim(), 'foo');
  this.set('field', 'bar');
  assert.equal(this.$('.column-onlyfield .ember-power-select-selected-item').text().trim(), 'foo');
});

test('it shows a subfield for a composite field', function(assert) {
  this.set('selected', { id: 'baz', hasFreeformField: true });
  this.render(hbs`{{column-field selectedColumn=selected subfieldKey='hasFreeformField' initialValue=field}}`);
  assert.equal(this.$('.column-mainfield .ember-power-select-trigger').text().trim(), 'baz');
  assert.ok(this.$('.column-subfield input').length, 1);
});

test('it sets the subfield for a composite field', function(assert) {
  this.set('selected', { id: 'baz', hasFreeformField: true });
  this.set('sub', 'foo');
  this.render(hbs`{{column-field selectedColumn=selected subfieldKey='hasFreeformField' subfield=sub}}`);
  assert.equal(this.$('.column-mainfield .ember-power-select-trigger').text().trim(), 'baz');
  assert.equal(this.$('.column-subfield input').val(), 'foo');
});

test('it calls the onDone action with the new field when the subfield loses focus', function(assert) {
  assert.expect(3);

  this.set('mockColumns', MOCK_COLUMNS);
  this.set('doneHandler', function(field) {
    assert.equal(field, 'bar.foo');
  });
  this.render(hbs`{{column-field columns=mockColumns initialValue='bar.baz' subfieldKey='hasFreeformField' subfieldSuffix='.*' subfieldSeparator='.' onDone=(action doneHandler)}}`);
  this.$('.column-subfield input').val('foo');
  assert.equal(this.$('.column-mainfield .ember-power-select-trigger').text().trim(), 'bar.*');
  assert.equal(this.$('.column-subfield input').val(), 'foo');
  this.$('.column-subfield input').trigger('focusout');
});

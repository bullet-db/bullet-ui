/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('validated-input', 'Integration | Component | validated input', {
  integration: true
});

function mockModel(isValid, isValidating, isDirty, message = null) {
  return Ember.Object.create({
    bar: 15,
    validations: {
      isValid: isValid,
      isInvalid: !isValid,
      attrs: {
        bar: {
          isValid: isValid,
          isInvalid: !isValid,
          isValidating: isValidating,
          isDirty: isDirty,
          message: message
        }
      }
    }
  });
}

test('it renders', function(assert) {
  this.render(hbs`{{validated-input}}`);

  assert.equal(this.$().text().trim(), '');
  this.render(hbs`
    {{#validated-input}}
      template block text
    {{/validated-input}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});

test('it yields a labeled-input component as input-field', function(assert) {
  let model = mockModel(15, true, false, false);
  this.set('mockModel', model);
  this.render(hbs`
    {{#validated-input model=mockModel valuePath='bar' as |v|}}
      {{v.input-field fieldName='label' fieldValue='test'}}
    {{/validated-input}}
  `);
  assert.equal(this.$('label').html(), 'label');
  assert.equal(this.$('input').val(), 'test');
});

test('it can yield a passed in component as input-field', function(assert) {
  let model = mockModel(true, false, false);
  this.set('mockModel', model);
  this.set('selected', { id: 'baz', hasFreeformField: true });
  this.render(hbs``);
  this.render(hbs`
    {{#validated-input inputField='column-field' model=mockModel valuePath='bar' as |v|}}
      {{v.input-field selectedColumn=selected subfieldKey='hasFreeformField' initialValue=field}}
    {{/validated-input}}
  `);
  assert.equal(this.$('.column-mainfield .ember-power-select-trigger').text().trim(), 'baz');
  assert.ok(this.$('.column-subfield input').length, 1);
});

test('it shows a validation error tooltip if there are errors and the field is dirty', function(assert) {
  let model = mockModel(false, false, true);
  this.set('mockModel', model);
  this.render(hbs`
    {{#validated-input model=mockModel valuePath='bar' as |v|}}
      {{v.input-field fieldName='label' fieldValue='test'}}
    {{/validated-input}}
  `);
  assert.equal(this.$('.error-tooltip-link').length, 1);
});

test('it does not show a error tooltip if there are errors and but the field is not dirty', function(assert) {
  let model = mockModel(false, false, false);
  this.set('mockModel', model);
  this.render(hbs`
    {{#validated-input model=mockModel valuePath='bar' as |v|}}
      {{v.input-field fieldName='label' fieldValue='test'}}
    {{/validated-input}}
  `);
  assert.equal(this.$('.error-tooltip-link').length, 0);
});

test('it does not show a error tooltip if the field is still validating', function(assert) {
  let model = mockModel(false, true, false);
  this.set('mockModel', model);
  this.render(hbs`
    {{#validated-input model=mockModel valuePath='bar' as |v|}}
      {{v.input-field fieldName='label' fieldValue='test'}}
    {{/validated-input}}
  `);
  assert.equal(this.$('.error-tooltip-link').length, 0);
});

test('it does not show a error tooltip if there are errors but the field is forced dirty even if it is not dirty', function(assert) {
  let model = mockModel(false, false, false);
  this.set('mockModel', model);
  this.render(hbs`
    {{#validated-input model=mockModel forceDirty=true valuePath='bar' as |v|}}
      {{v.input-field fieldName='label' fieldValue='test'}}
    {{/validated-input}}
  `);
  assert.equal(this.$('.error-tooltip-link').length, 1);
});

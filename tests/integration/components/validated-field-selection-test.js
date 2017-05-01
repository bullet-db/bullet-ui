/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('validated-field-selection', 'Integration | Component | validated field selection', {
  integration: true
});

const MOCK_COLUMNS = [
  { id: 'foo' },
  { id: 'bar' },
  { id: 'bar.*', hasFreeformField: true },
  { id: 'baz.qux' },
  { id: 'baz.norf' }
];

function mockModel(isValid, isValidating, isDirty, field = 'foo', message = null) {
  return Ember.Object.create({
    field: field,
    name: null,

    validations: {
      isValid: isValid,
      isInvalid: !isValid,
      attrs: {
        field: {
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

test('it shows a validation error tooltip if there are errors and the field is dirty', function(assert) {
  let model = mockModel(false, false, true);
  this.set('mockModel', model);
  this.set('mockColumns', MOCK_COLUMNS);
  this.render(hbs`{{validated-field-selection columns=mockColumns model=mockModel}}`);
  assert.equal(this.$('.error-tooltip-link').length, 1);
});

test('it does not show a error tooltip if there are errors and but the field is not dirty', function(assert) {
  let model = mockModel(false, false, false);
  this.set('mockModel', model);
  this.set('mockColumns', MOCK_COLUMNS);
  this.render(hbs`{{validated-field-selection columns=mockColumns model=mockModel}}`);
  assert.equal(this.$('.error-tooltip-link').length, 0);
});

test('it does not show a error tooltip if the field is still validating', function(assert) {
  let model = mockModel(false, true, false);
  this.set('mockModel', model);
  this.set('mockColumns', MOCK_COLUMNS);
  this.render(hbs`{{validated-field-selection columns=mockColumns model=mockModel}}`);
  assert.equal(this.$('.error-tooltip-link').length, 0);
});

test('it does not show a error tooltip if there are errors but the field is forced dirty even if it is not dirty', function(assert) {
  let model = mockModel(false, false, false);
  this.set('mockModel', model);
  this.set('mockColumns', MOCK_COLUMNS);
  this.render(hbs`{{validated-field-selection columns=mockColumns model=mockModel forceDirty=true}}`);
  assert.equal(this.$('.error-tooltip-link').length, 1);
});

test('it displays a field, a name and a delete button with yieldable contents', function(assert) {
  let model = mockModel(true, false, true);
  this.set('mockModel', model);
  this.set('mockColumns', MOCK_COLUMNS);
  this.render(hbs`
    {{#validated-field-selection columns=mockColumns model=mockModel nameClasses="custom-name" fieldClasses="custom-field"}}
      <span class="custom-input">foo</span>
    {{/validated-field-selection}}
  `);
  assert.equal(this.$('.error-tooltip-link').length, 0);
  assert.equal(this.$('.custom-input').length, 1);
  assert.equal(this.$('.custom-input').text().trim(), 'foo');
  assert.equal(this.$('.field-selection').length, 1);
  assert.ok(this.$('.field-selection').hasClass('custom-field'));
  assert.equal(this.$('.field-name').length, 1);
  assert.ok(this.$('.field-name').hasClass('custom-name'));
  assert.equal(this.$('.delete-button').length, 1);
});

test('it can disable field selection', function(assert) {
  let model = mockModel(true, false, true);
  this.set('mockModel', model);
  this.set('mockColumns', MOCK_COLUMNS);
  this.set('disableField', true);
  this.render(hbs`
    {{validated-field-selection columns=mockColumns model=mockModel nameClasses="custom-name" disableField=disableField}}
  `);
  assert.equal(this.$('.error-tooltip-link').length, 0);
  assert.equal(this.$('.field-selection').length, 0);
  assert.equal(this.$('.field-name').length, 1);
  assert.ok(this.$('.field-name').hasClass('custom-name'));
  assert.equal(this.$('.delete-button').length, 1);
});

test('it can disable renaming', function(assert) {
  let model = mockModel(true, false, true);
  this.set('mockModel', model);
  this.set('mockColumns', MOCK_COLUMNS);
  this.set('enableRenaming', false);
  this.render(hbs`
    {{validated-field-selection columns=mockColumns model=mockModel fieldClasses="custom-field" enableRenaming=enableRenaming}}
  `);
  assert.equal(this.$('.error-tooltip-link').length, 0);
  assert.equal(this.$('.field-selection').length, 1);
  assert.ok(this.$('.field-selection').hasClass('custom-field'));
  assert.equal(this.$('.field-name').length, 0);
  assert.equal(this.$('.delete-button').length, 1);
});

test('it can disable deleting', function(assert) {
  let model = mockModel(true, false, true);
  this.set('mockModel', model);
  this.set('mockColumns', MOCK_COLUMNS);
  this.set('enableDeleting', false);
  this.render(hbs`
    {{validated-field-selection columns=mockColumns model=mockModel fieldClasses="custom-field" enableDeleting=enableDeleting}}
  `);
  assert.equal(this.$('.error-tooltip-link').length, 0);
  assert.equal(this.$('.field-selection').length, 1);
  assert.ok(this.$('.field-selection').hasClass('custom-field'));
  assert.equal(this.$('.field-name').length, 1);
  assert.equal(this.$('.delete-button').length, 0);
});

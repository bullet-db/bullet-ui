/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | validated field selection', function(hooks) {
  setupRenderingTest(hooks);

  const MOCK_COLUMNS = [
    { id: 'foo' },
    { id: 'bar' },
    { id: 'bar.*', hasFreeformField: true },
    { id: 'baz.qux' },
    { id: 'baz.norf' }
  ];

  function mockModel(isValid, isValidating, isDirty, field = 'foo', message = null) {
    return EmberObject.create({
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

  test('it shows a validation error tooltip if there are errors and the field is dirty', async function(assert) {
    let model = mockModel(false, false, true);
    this.set('mockModel', model);
    this.set('mockColumns', MOCK_COLUMNS);
    await render(hbs`{{validated-field-selection columns=mockColumns model=mockModel}}`);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 1);
  });

  test('it does not show a error tooltip if there are errors and but the field is not dirty', async function(assert) {
    let model = mockModel(false, false, false);
    this.set('mockModel', model);
    this.set('mockColumns', MOCK_COLUMNS);
    await render(hbs`{{validated-field-selection columns=mockColumns model=mockModel}}`);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 0);
  });

  test('it does not show a error tooltip if the field is still validating', async function(assert) {
    let model = mockModel(false, true, false);
    this.set('mockModel', model);
    this.set('mockColumns', MOCK_COLUMNS);
    await render(hbs`{{validated-field-selection columns=mockColumns model=mockModel}}`);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 0);
  });

  test('it does not show a error tooltip if there are errors but the field is forced dirty even if it is not dirty', async function(assert) {
    let model = mockModel(false, false, false);
    this.set('mockModel', model);
    this.set('mockColumns', MOCK_COLUMNS);
    await render(hbs`{{validated-field-selection columns=mockColumns model=mockModel forceDirty=true}}`);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 1);
  });

  test('it displays a field, a name and a delete button with yieldable contents', async function(assert) {
    let model = mockModel(true, false, true);
    this.set('mockModel', model);
    this.set('mockColumns', MOCK_COLUMNS);
    await render(hbs`
      {{#validated-field-selection columns=mockColumns model=mockModel nameClasses="custom-name" fieldClasses="custom-field"}}
        <span class="custom-input">foo</span>
      {{/validated-field-selection}}
    `);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 0);
    assert.equal(this.element.querySelectorAll('.custom-input').length, 1);
    assert.dom(this.element.querySelector('.custom-input')).hasText('foo');
    assert.equal(this.element.querySelectorAll('.field-selection').length, 1);
    assert.dom(this.element.querySelector('.field-selection')).hasClass('custom-field');
    assert.equal(this.element.querySelectorAll('.field-name').length, 1);
    assert.dom(this.element.querySelector('.field-name')).hasClass('custom-name');
    assert.equal(this.element.querySelectorAll('.delete-button').length, 1);
  });

  test('it can disable field selection', async function(assert) {
    let model = mockModel(true, false, true);
    this.set('mockModel', model);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('disableField', true);
    await render(hbs`
      {{validated-field-selection columns=mockColumns model=mockModel nameClasses="custom-name" disableField=disableField}}
    `);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 0);
    assert.equal(this.element.querySelectorAll('.field-selection').length, 0);
    assert.equal(this.element.querySelectorAll('.field-name').length, 1);
    assert.dom(this.element.querySelector('.field-name')).hasClass('custom-name');
    assert.equal(this.element.querySelectorAll('.delete-button').length, 1);
  });

  test('it can disable renaming', async function(assert) {
    let model = mockModel(true, false, true);
    this.set('mockModel', model);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('enableRenaming', false);
    await render(hbs`
      {{validated-field-selection columns=mockColumns model=mockModel fieldClasses="custom-field" enableRenaming=enableRenaming}}
    `);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 0);
    assert.equal(this.element.querySelectorAll('.field-selection').length, 1);
    assert.dom(this.element.querySelector('.field-selection')).hasClass('custom-field');
    assert.equal(this.element.querySelectorAll('.field-name').length, 0);
    assert.equal(this.element.querySelectorAll('.delete-button').length, 1);
  });

  test('it can disable deleting', async function(assert) {
    let model = mockModel(true, false, true);
    this.set('mockModel', model);
    this.set('mockColumns', MOCK_COLUMNS);
    this.set('enableDeleting', false);
    await render(hbs`
      {{validated-field-selection columns=mockColumns model=mockModel fieldClasses="custom-field" enableDeleting=enableDeleting}}
    `);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 0);
    assert.equal(this.element.querySelectorAll('.field-selection').length, 1);
    assert.dom(this.element.querySelector('.field-selection')).hasClass('custom-field');
    assert.equal(this.element.querySelectorAll('.field-name').length, 1);
    assert.equal(this.element.querySelectorAll('.delete-button').length, 0);
  });
});

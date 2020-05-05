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

module('Integration | Component | validated input', function(hooks) {
  setupRenderingTest(hooks);

  function mockModel(isValid, isValidating, isDirty) {
    return EmberObject.create({
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
            message: null
          }
        }
      }
    });
  }

  test('it does not block render', async function(assert) {
    await render(hbs`{{validated-input}}`);

    assert.dom(this.element).hasText('');
    await render(hbs`
      {{#validated-input}}
        template block text
      {{/validated-input}}
    `);

    assert.dom(this.element).hasText('');
  });

  test('it renders a labeled-input component as input-field', async function(assert) {
    let model = mockModel(true, false, false);
    this.set('mockModel', model);
    await render(hbs`
      {{validated-input model=mockModel valuePath='bar' fieldName='label' fieldValue='test'}}
    `);
    assert.equal(this.element.querySelector('label').innerHTML, 'label');
    assert.equal(this.element.querySelector('input').value, '15');
  });

  test('it shows a validation error tooltip if there are errors and the field is dirty', async function(assert) {
    let model = mockModel(false, false, true);
    this.set('mockModel', model);
    await render(hbs`
      {{validated-input model=mockModel valuePath='bar' fieldName='label' fieldValue='test'}}
    `);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 1);
  });

  test('it does not show a error tooltip if there are errors and but the field is not dirty', async function(assert) {
    let model = mockModel(false, false, false);
    this.set('mockModel', model);
    await render(hbs`
      {{validated-input model=mockModel valuePath='bar' fieldName='label' fieldValue='test'}}
    `);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 0);
  });

  test('it does not show a error tooltip if the field is still validating', async function(assert) {
    let model = mockModel(false, true, false);
    this.set('mockModel', model);
    await render(hbs`
      {{validated-input model=mockModel valuePath='bar' fieldName='label' fieldValue='test'}}
    `);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 0);
  });

  test('it does not show a error tooltip if there are errors but the field is forced dirty even if it is not dirty', async function(assert) {
    let model = mockModel(false, false, false);
    this.set('mockModel', model);
    await render(hbs`
      {{validated-input model=mockModel forceDirty=true valuePath='bar' fieldName='label' fieldValue='test'}}
    `);
    assert.equal(this.element.querySelectorAll('.error-tooltip-link').length, 1);
  });
});

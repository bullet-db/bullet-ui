/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | radio button', function(hooks) {
  setupRenderingTest(hooks);

  test('it can add additional content in block form', async function(assert) {
    await render(hbs`
      <RadioButton @id='radio-id' @value='bar' @checkedValue='foo'>
        Test Value
      </RadioButton>`);
    assert.dom('label').includesText('Test Value');
  });

  test('it renders a radio button with the given id and checks if the value is the same', async function(assert) {
    await render(hbs`<RadioButton @id='radio-id' @value='foo' @checkedValue='foo'/>`);

    assert.dom('label').hasClass('checked');
    assert.dom('label').hasAttribute('for', 'radio-id');
    assert.dom('label input').isChecked();
  });

  test('it calls the changed action and the updated action with the value on change', async function(assert) {
    assert.expect(6);
    this.set('mockCheckedValue', 'bar')
    this.set('mockUpdated', (value) => {
      assert.equal(value, 'foo')
      this.set('mockCheckedValue', value);
    });
    this.set('mockChanged', () => {
      assert.ok(true);
    });
    await render(hbs`<RadioButton @id='radio-id' @value='foo' @checkedValue={{this.mockCheckedValue}}
                                  @updated={{this.mockUpdated}} @changed={{this.mockChanged}}/>`);
    assert.dom('label').doesNotHaveClass('checked');
    assert.dom('label input').isNotChecked();
    await click('#radio-id');
    assert.dom('label').hasClass('checked');
    assert.dom('label input').isChecked();
  });
});

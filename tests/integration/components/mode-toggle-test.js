/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | mode toggle', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders two modes with the off view by default', async function(assert) {
    await render(hbs`<ModeToggle/>`);
    assert.dom('.mode').exists({ count: 2 });

    await render(hbs`<ModeToggle>template block text</ModeToggle>`);
    assert.dom('.mode').exists({ count: 2 });
    assert.dom('.on-view').doesNotHaveAttribute('hidden');
    assert.dom('.off-view').hasAttribute('hidden');
  });

  test('it allows you to toggle modes', async function(assert) {
    assert.expect(5);
    this.set('mockToggled', isToggled => {
      assert.notOk(isToggled);
    });
    await render(hbs`<ModeToggle @isToggled={{true}} @onToggle={{this.mockToggled}}/>`);
    assert.dom('.on-view').hasAttribute('hidden');
    assert.dom('.off-view').doesNotHaveAttribute('hidden');
    await click('.off-view');
    assert.dom('.on-view').doesNotHaveAttribute('hidden');
    assert.dom('.off-view').hasAttribute('hidden');
  });

  test('it tracks the passed in toggled state when it changes', async function(assert) {
    this.set('mockToggled', isToggled => { });
    this.set('mockIsToggled', true);

    // isToggled => true
    await render(hbs`<ModeToggle @isToggled={{this.mockIsToggled}} @onToggle={{this.mockToggled}}/>`);
    assert.dom('.on-view').hasAttribute('hidden');
    assert.dom('.off-view').doesNotHaveAttribute('hidden');
    // isToggled => false
    await click('.off-view');
    assert.dom('.on-view').doesNotHaveAttribute('hidden');
    assert.dom('.off-view').hasAttribute('hidden');
    // isToggled => true
    await click('.on-view');
    assert.dom('.on-view').hasAttribute('hidden');
    assert.dom('.off-view').doesNotHaveAttribute('hidden');

    // Force set the original back to false and check if the component updated
    this.set('mockIsToggled', false);
    await settled();
    // isToggled => false by the args change
    assert.dom('.on-view').doesNotHaveAttribute('hidden');
    assert.dom('.off-view').hasAttribute('hidden');
  });
});

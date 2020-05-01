/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | result window placeholder', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a message to switch between windows', async function(assert) {
    await render(hbs`{{result-window-placeholder}}`);
    assert.equal(this.element.textContent.trim(), 'Switch between 0 windows...');
  });

  test('it displays a message to switch between the given count of windows', async function(assert) {
    await render(hbs`{{result-window-placeholder windowCount=100}}`);
    assert.equal(this.element.textContent.trim(), 'Switch between 100 windows...');
  });

  test('it displays a different message in aggregate mode', async function(assert) {
    await render(hbs`{{result-window-placeholder windowCount=100 aggregateMode=true}}`);
    assert.equal(this.element.textContent.trim(), 'Aggregating across your windows...');
  });
});

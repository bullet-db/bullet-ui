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
    await render(hbs`<ResultWindowPlaceholder @windowCount={{0}}/>`);
    assert.dom(this.element).hasText('Switch between 0 windows...');
  });

  test('it displays a message to switch between the given count of windows', async function(assert) {
    await render(hbs`<ResultWindowPlaceholder @windowCount={{100}}/>`);
    assert.dom(this.element).hasText('Switch between 100 windows...');
  });

  test('it displays a different message in aggregate mode', async function(assert) {
    await render(hbs`<ResultWindowPlaceholder @windowCount={{100}} @aggregateMode={{true}}/>`);
    assert.dom(this.element).hasText('Aggregating across your windows...');
  });
});

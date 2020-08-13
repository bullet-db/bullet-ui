/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | timed progress bar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<TimedProgressBar/>`);
    assert.dom(this.element).hasText('100%');
    await render(hbs`<TimedProgressBar>template block text</TimedProgressBar>`);
    assert.ok(this.element.textContent.trim().match('100%'));
  });

  test('it can be made active', async function(assert) {
    await render(hbs`<TimedProgressBar @active={{true}} @duration={{100}} @updateInterval={{100}}/>`);
    assert.dom(this.element).hasText('100%');
  });

  test('it can skip displaying a percentage', async function(assert) {
    await render(hbs`<TimedProgressBar @useStep={{false}}/>`);
    assert.dom(this.element).hasText('');
  });
});

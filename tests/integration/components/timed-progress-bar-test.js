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
    await render(hbs`{{timed-progress-bar}}`);
    assert.equal(this.element.textContent.trim(), '100%');

    await render(hbs`
      {{#timed-progress-bar}}
        template block text
      {{/timed-progress-bar}}
    `);
    assert.ok(this.element.textContent.trim().match('100%'));
  });

  test('it can be made active', async function(assert) {
    await render(hbs`{{timed-progress-bar active=true duration=100 updateInterval=100}}`);
    assert.equal(this.element.textContent.trim(), '100%');
  });

  test('it calls the finished action', async function(assert) {
    assert.expect(1);
    this.set('finishedAction', () => {
      assert.ok(true, 'finished was called');
    });
    await render(hbs`{{timed-progress-bar active=true duration=100 finished=(action finishedAction)}}`);
  });

  test('it can skip displaying a percentage', async function(assert) {
    await render(hbs`{{timed-progress-bar useStep=false}}`);
    assert.equal(this.element.textContent.trim(), '');
  });
});

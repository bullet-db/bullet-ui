/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | eq', function(hooks) {
  setupRenderingTest(hooks);

  test('it allows you to check for equality', async function(assert) {
    this.set('inputValue', '1234');
    await render(hbs`{{if (eq inputValue "1234") "foo" "bar"}}`);
    assert.equal(this.element.textContent.trim(), 'foo');
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | result metadata', function(hooks) {
  setupRenderingTest(hooks);

  test('it does not block render', async function(assert) {
    await render(hbs`{{result-metadata}}`);
    assert.equal(this.element.textContent.trim(), '');
    await render(hbs`
      {{#result-metadata}}
        template block text
      {{/result-metadata}}
    `);
    assert.equal(this.element.textContent.trim(), '');
  });

  test('it expands metadata on clicking the expand bar', async function(assert) {
    assert.expect(3);

    this.set('mockMetadata', 'custom metadata');
    await render(hbs`{{result-metadata metadata=mockMetadata}}`);
    assert.notOk(this.element.querySelector('.result-metadata').classList.contains('is-expanded'));
    await click('.expand-bar');
    assert.ok(this.element.querySelector('.result-metadata').classList.contains('is-expanded'));
    assert.equal(this.element.querySelector('pre').textContent.trim(), '"custom metadata"');
  });
});

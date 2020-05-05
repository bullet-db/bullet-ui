/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | window metadata', function(hooks) {
  setupRenderingTest(hooks);

  test('it does not block render', async function(assert) {
    await render(hbs`{{window-metadata}}`);
    assert.dom(this.element).hasText('');
    await render(hbs`
      {{#window-metadata}}
        template block text
      {{/window-metadata}}
    `);
    assert.dom(this.element).hasText('');
  });

  test('it expands metadata on clicking the expand bar', async function(assert) {
    assert.expect(3);

    this.set('mockMetadata', 'custom metadata');
    await render(hbs`{{window-metadata metadata=mockMetadata}}`);
    assert.dom(this.element.querySelector('.window-metadata')).hasNoClass('is-expanded');
    await click('.expand-bar');
    assert.dom(this.element.querySelector('.window-metadata')).hasClass('is-expanded');
    assert.dom(this.element.querySelector('pre')).hasText('"custom metadata"');
  });
});

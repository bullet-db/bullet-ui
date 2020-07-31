/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Cell | schema description entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Cells::SchemaDescriptionEntry @value='foo'/>`);

    assert.dom(this.element).hasText('foo');
  });

  test('it renders html', async function(assert) {
    await render(hbs`<Cells::SchemaDescriptionEntry @value='<div><p>foo</p></div>'/>`);

    assert.dom(this.element).hasText('foo');
    assert.dom('div > p').exists({ count: 1 });
  });
});

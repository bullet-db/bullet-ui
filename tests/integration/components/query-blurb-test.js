/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | query blurb', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<QueryBlurb/>`);
    assert.dom(this.element).hasNoText();

    await render(hbs`<QueryBlurb>template block text</QueryBlurb>`);
    assert.dom(this.element).hasNoText();
  });

  test('it summarizes a query', async function(assert) {
    this.set('mockedQuery', 'SELECT * FROM STREAM(1000, TIME) WHERE mock = false');
    await render(hbs`<QueryBlurb @summary={{this.mockedQuery}}/>`);
    assert.dom(this.element).includesText('SELECT * FROM STREAM(1000, TIME) WHERE mock = false');
  });
});

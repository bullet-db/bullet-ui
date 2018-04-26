/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Cell | schema description entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{cells/schema-description-entry value='foo'}}`);

    assert.equal(this.$().text().trim(), 'foo');
  });

  test('it renders html', async function(assert) {
    await render(hbs`{{cells/schema-description-entry value='<div><p>foo</p></div>'}}`);

    assert.equal(this.$().text().trim(), 'foo');
    assert.equal(this.$('div > p').length, 1);
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Cell | schema type entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a type value', async function(assert) {
    await render(hbs`{{cells/schema-type-entry value='MAP OF STRINGS TO STRINGS'}}`);
    assert.dom(this.element).hasText('MAP OF STRINGS TO STRINGS');
  });
});

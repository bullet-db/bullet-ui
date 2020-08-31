/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { EMIT_TYPES } from 'bullet-ui/utils/query-constants';

module('Integration | Helper | desc', function(hooks) {
  setupRenderingTest(hooks);

  test('it allows you to describe enumerated query types', async function(assert) {
    this.set('enum', EMIT_TYPES);
    this.set('type', EMIT_TYPES.RECORD);
    await render(hbs`{{desc this.enum this.type}}`);
    assert.equal(this.element.textContent.trim(), EMIT_TYPES.describe(EMIT_TYPES.RECORD));
  });
});

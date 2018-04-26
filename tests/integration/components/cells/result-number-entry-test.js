/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Cell | result number entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it calls the table action resultClick on click with a given row', async function(assert) {
    assert.expect(3);
    this.set('mockTableActions', {
      resultClick(value) {
        assert.ok(true);
        assert.equal(value, 'foo');
      }
    });
    await render(hbs`{{cells/result-number-entry tableActions=mockTableActions value='length is 12' row='foo'}}`);
    assert.equal(this.$().text().trim(), '12');
    await click('span');
  });
});

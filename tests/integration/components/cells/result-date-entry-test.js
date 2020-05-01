/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Cell | result date entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it calls the table action resultClick on click with the row', async function(assert) {
    assert.expect(2);
    this.set('mockTableActions', {
      resultClick(value) {
        assert.ok(true);
        assert.equal(value, 'foo');
      }
    });
    await render(hbs`{{cells/result-date-entry tableActions=mockTableActions row='foo'}}`);
    await click('span');
  });
});

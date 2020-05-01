/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Cell | query date entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it calls the table action resultClick on click with a given value', async function(assert) {
    assert.expect(1);
    this.set('mockTableActions', {
      resultClick(value) {
        assert.equal(value, 'foo');
      }
    });
    await render(hbs`{{cells/query-date-entry tableActions=mockTableActions value='foo'}}`);
    await click('span');
  });

  test('it does not call the table action resultClick on click if there is no value', async function(assert) {
    assert.expect(0);
    this.set('mockTableActions', {
      resultClick() {
        assert.ok(false);
      }
    });
    await render(hbs`{{cells/query-date-entry tableActions=mockTableActions}}`);
    return click('span');
  });
});

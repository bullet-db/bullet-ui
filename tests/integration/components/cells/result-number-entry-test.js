/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('result-number-entry', 'Integration | Component | Cell | result number entry', {
  integration: true
});

test('it calls the table action resultClick on click with a given row', function(assert) {
  assert.expect(3);
  this.set('mockTableActions', {
    resultClick(value) {
      assert.ok(true);
      assert.equal(value, 'foo');
    }
  });
  this.render(hbs`{{cells/result-number-entry tableActions=mockTableActions value='length is 12' row='foo'}}`);
  assert.equal(this.$().text().trim(), '12');
  this.$('span').click();
  return wait();
});

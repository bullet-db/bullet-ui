/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('result-date-entry', 'Integration | Component | Cell | result date entry', {
  integration: true
});

test('it calls the table action resultClick on click with the row', function(assert) {
  assert.expect(2);
  this.set('mockTableActions', {
    resultClick(value) {
      assert.ok(true);
      assert.equal(value, 'foo');
    }
  });
  this.render(hbs`{{cells/result-date-entry tableActions=mockTableActions row='foo'}}`);
  this.$('span').click();
  return wait();
});

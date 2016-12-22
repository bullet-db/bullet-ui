/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('query-date-entry', 'Integration | Component | Cell | query date entry', {
  integration: true
});

test('it calls the table action resultClick on click with a given value', function(assert) {
  assert.expect(1);
  this.set('mockTableActions', {
    resultClick(value) {
      assert.equal(value, 'foo');
    }
  });
  this.render(hbs`{{cells/query-date-entry tableActions=mockTableActions value='foo'}}`);
  this.$('span').click();
  return wait();
});

test('it does not call the table action resultClick on click if there is no value', function(assert) {
  assert.expect(0);
  this.set('mockTableActions', {
    resultClick() {
      assert.ok(false);
    }
  });
  this.render(hbs`{{cells/query-date-entry tableActions=mockTableActions}}`);
  this.$('span').click();
  return wait();
});

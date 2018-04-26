/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | query', function(hooks) {
  setupTest(hooks);

  test('it aborts a pending request if one exists', function(assert) {
    assert.expect(1);
    let route = this.owner.lookup('route:query');
    route.set('pendingRequest', {
      disconnect() {
        assert.ok(true);
      }
    });
    route.send('cancelQuery');
  });
});

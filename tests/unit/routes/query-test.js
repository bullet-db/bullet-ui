/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleFor, test } from 'ember-qunit';

moduleFor('route:query', 'Unit | Route | query', {
});

test('it aborts a pending request if one exists', function(assert) {
  assert.expect(1);
  let route = this.subject();
  route.set('pendingRequest', {
    abort() {
      assert.ok(true);
    }
  });
  route.send('cancelQuery');
});

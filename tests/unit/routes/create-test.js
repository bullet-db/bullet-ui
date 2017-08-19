/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleFor, test } from 'ember-qunit';

moduleFor('route:create', 'Unit | Route | create', {
  needs: ['service:querier', 'service:queryManager']
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});

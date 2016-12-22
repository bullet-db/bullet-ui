/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('filter', 'Unit | Model | filter', {
  needs: ['model:query']
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});

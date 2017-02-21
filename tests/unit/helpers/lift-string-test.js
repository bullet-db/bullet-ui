/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { liftString } from 'bullet-ui/helpers/lift-string';
import { module, test } from 'qunit';

module('Unit | Helper | lift string');

// Replace this with your real tests.
test('it is identity for non-strings', function(assert) {
  assert.equal(liftString([42]), undefined);
  assert.equal(liftString(['', 42]), 42);
  assert.equal(liftString(['key', 42]), 42);
  assert.deepEqual(liftString(['key', []]), []);
  assert.deepEqual(liftString(['key', { }]), { });
});

test('it lifts strings into an object with the proper key', function(assert) {
  let result = liftString(['key', 'value']);
  assert.equal(result.get('key'), 'value');
});

/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { eq } from 'bullet-ui/helpers/eq';
import { module, test } from 'qunit';

module('Unit | Helper | eq', function() {
  test('it compares two things for equality', function(assert) {
    assert.false(eq([42, undefined]))
    assert.true(eq([42, 42]))
    assert.true(eq(['', '']))
    assert.true(eq(['foo', 'foo']))
    assert.false(eq(['foo', 'bar']))
  });
});

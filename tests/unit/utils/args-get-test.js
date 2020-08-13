/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import argsGet from 'bullet-ui/utils/args-get';
import { module, test } from 'qunit';

module('Unit | Utility | args-get', function() {
  test('it gets a top level value from args with a default', function(assert) {
    assert.equal(argsGet({ foo: 'bar', qux: false }, 'foo', 'baz'), 'bar');
    assert.equal(argsGet({ foo: 'bar', qux: false }, 'bar', 'baz'), 'baz');
    assert.equal(argsGet({ foo: 'bar', qux: false }, 'qux', true), false);
    assert.equal(argsGet({ foo: 'bar', qux: false }, 'baz', true), true);
  });
});

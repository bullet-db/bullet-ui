/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import currentValue from 'bullet-ui/utils/current-value';
import { module, test } from 'qunit';

module('Unit | Utility | current-value', function() {
  test('it fetches from changes first', function(assert) {
    let changes = { foo: 'bar' };
    let content = { foo: 'baz' };
    let result = currentValue(changes, content, ['foo']);
    assert.equal(result.foo, 'bar');
  });

  test('it fetches from content second', function(assert) {
    let changes = { qux: 'bar' };
    let content = { foo: 'baz' };
    let result = currentValue(changes, content, ['foo']);
    assert.equal(result.foo, 'baz');
  });

  test('it can inspect nested objects', function(assert) {
    let changes = { foo: { bar: 'baz' }};
    let content = { foo: { bar: 'qux' }};
    let result = currentValue(changes, content, ['foo.bar']);
    assert.equal(result['foo.bar'], 'baz');

    changes = { foo: { qux: 'baz' }};
    content = { foo: { bar: 'norf' }};
    result = currentValue(changes, content, ['foo.bar']);
    assert.equal(result['foo.bar'], 'norf');
  });

  test('it can fetch multiple keys', function(assert) {
    let changes = { foo: { bar: 'baz', quux: 1 }, qux: false };
    let content = { foo: { qux: 'baz', boo: 42 }, qux: true };
    let result = currentValue(changes, content, ['foo.bar', 'foo.qux', 'foo.quux', 'foo.boo', 'qux', 'foo.moo', 'moo']);
    assert.equal(result['foo.bar'], 'baz');
    assert.equal(result['foo.qux'], 'baz');
    assert.equal(result['foo.quux'], 1);
    assert.equal(result['foo.boo'], 42);
    assert.equal(result['qux'], false);
    assert.equal(result['foo.moo'], undefined);
    assert.equal(result['moo'], undefined);
  });
});

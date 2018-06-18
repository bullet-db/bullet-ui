/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { A } from '@ember/array';

module('Unit | Transform | window array', function(hooks) {
  setupTest(hooks);

  test('it can deserialize an array to an Ember array', function(assert) {
    let transform = this.owner.lookup('transform:window-array');
    let deserialized = transform.get('deserialize')(['foo', 'bar']);
    assert.ok(deserialized.get('length'), 2);
    assert.ok(deserialized.objectAt(0), 'foo');
    assert.ok(deserialized.objectAt(1), 'bar');
  });

  test('it can serialize an Ember array to an array', function(assert) {
    let transform = this.owner.lookup('transform:window-array');
    let serialized = transform.get('serialize')(A(['foo', 'bar']));
    assert.ok(serialized.length, 2);
    assert.ok(serialized[0], 'foo');
    assert.ok(serialized[1], 'bar');
  });
});

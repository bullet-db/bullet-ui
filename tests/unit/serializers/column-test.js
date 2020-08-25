/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
 import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | column', function(hooks) {
  setupTest(hooks);

  test('it does not dasherize attributes', function(assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('column');

    assert.ok(serializer);

    let record = store.createRecord('column', { subFields: ['foo'], subSubFields: ['bar'], subListFields: ['baz'] });
    let serializedRecord = record.serialize();
    assert.ok(serializedRecord);
    assert.deepEqual(
      serializedRecord.data.attributes,
      { name: null, type: null, description: null, subFields: ['foo'], subSubFields: ['bar'], subListFields: ['baz'] }
    );
  });
});

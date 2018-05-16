/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { EMIT_TYPES } from 'bullet-ui/models/window';

module('Unit | Validator | window-emit-frequency', function(hooks) {
  setupTest(hooks);

  test('it does not let you exceed the query duration when it is time based window', function(assert) {
    var validator = this.owner.lookup('validator:window-emit-frequency');
    let query = EmberObject.create({
      duration: 20
    });
    let mockModel = EmberObject.create({
      emit: {
        type: EMIT_TYPES.get('TIME')
      },
      query: query
    });
    let expected = 'The window emit frequency should not be longer than the query duration (20 seconds)';
    assert.equal(validator.validate(21, null, mockModel), expected);
    assert.ok(validator.validate(20, null, mockModel));
  });

  test('it does not let you exceed the minimum emit frequency when it is time based window', function(assert) {
    var validator = this.owner.lookup('validator:window-emit-frequency');
    let query = EmberObject.create({
      duration: 20
    });
    let mockModel = EmberObject.create({
      emit: {
        type: EMIT_TYPES.get('TIME')
      },
      query: query,
      settings: {
        defaultValues: {
          windowEmitFrequencyMinSecs: 10
        }
      }
    });
    let expected = 'The maintainer has configured Bullet to support a minimum of 10s for emit frequency';
    assert.equal(validator.validate(9, null, mockModel), expected);
    assert.ok(validator.validate(10, null, mockModel));
  });

  test('it successfully validates when it is record based window', function(assert) {
    var validator = this.owner.lookup('validator:window-emit-frequency');
    let query = EmberObject.create({
      duration: 20
    });
    let mockModel = EmberObject.create({
      emit: {
        type: EMIT_TYPES.get('RECORD')
      },
      query: query
    });
    assert.ok(validator.validate(21, null, mockModel));
    assert.ok(validator.validate(20, null, mockModel));
  });
});

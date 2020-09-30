/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import validateQueryMaxDuration from 'bullet-ui/validators/query-max-duration';

module('Unit | Validator | query max duration', function(hooks) {
  setupTest(hooks);

  test('it does not let you exceed the maximum duration', function(assert) {
    let validate = validateQueryMaxDuration();
    let mockModel = EmberObject.create({
      duration: 120000,
      settings: {
        defaultValues: {
          durationMaxSecs: 120
        }
      }
    });
    let expected = 'The maintainer has configured Bullet to support a maximum of 120000 ms for maximum duration';
    assert.equal(validate('duration', 121000, 120000, { }, mockModel), expected);
    mockModel.set('duration', null);
    assert.ok(validate('duration', 120000, 120000, { }, mockModel));
  });
});

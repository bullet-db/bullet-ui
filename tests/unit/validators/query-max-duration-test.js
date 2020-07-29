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

  test('it does not let you exceed the maximum duration seconds', function(assert) {
    let validate = validateQueryMaxDuration();
    let mockModel = EmberObject.create({
      duration: 120,
      settings: {
        defaultValues: {
          durationMaxSecs: 120
        }
      }
    });
    let expected = 'The maintainer has configured Bullet to support a maximum of 120s for maximum duration';
    assert.equal(validate('duration', 121, 120, { }, mockModel), expected);
    mockModel.set('duration', null);
    assert.ok(validate('duration', 120, 120, { }, mockModel));
  });
});

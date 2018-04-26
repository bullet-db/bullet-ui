/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | query-max-duration', function(hooks) {
  setupTest(hooks);

  test('it does not let you exceed the maximum duration seconds', function(assert) {
    var validator = this.owner.lookup('validator:query-max-duration');
    let mockModel = EmberObject.create({
      settings: {
        defaultValues: {
          durationMaxSecs: 120
        }
      }
    });
    let expected = 'The maintainer has configured Bullet to support a maximum of 120s for maximum duration';
    assert.equal(validator.validate(121, null, mockModel), expected);
    assert.ok(validator.validate(120, null, mockModel));
  });
});

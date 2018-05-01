/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

module('Unit | Validator | aggregation-max-size', function(hooks) {
  setupTest(hooks);

  test('it does not let you exceed the maximum aggregation size', function(assert) {
    var validator = this.owner.lookup('validator:aggregation-max-size');
    let mockModel = EmberObject.create({
      type: AGGREGATIONS.get('GROUP'),
      settings: {
        defaultValues: {
          rawMaxSize: 100,
          aggregationMaxSize: 500
        }
      }
    });
    let expected = 'The maintainer has configured Bullet to support a maximum of 500 for result count';
    assert.equal(validator.validate(501, null, mockModel), expected);
    assert.ok(validator.validate(500, null, mockModel));
  });

  test('it does not let you exceed the maximum size for the Raw aggregation', function(assert) {
    var validator = this.owner.lookup('validator:aggregation-max-size');
    let mockModel = EmberObject.create({
      type: AGGREGATIONS.get('RAW'),
      settings: {
        defaultValues: {
          rawMaxSize: 100,
          aggregationMaxSize: 500
        }
      }
    });
    let expected = 'The maintainer has set the Raw type to support a maximum of 100 for result count';
    assert.equal(validator.validate(101, null, mockModel), expected);
    assert.ok(validator.validate(100, null, mockModel));
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

moduleFor('validator:aggregation-max-size', 'Unit | Validator | aggregation-max-size', {
  needs: ['validator:messages']
});

test('it does not let you exceed the maximum aggregation size', function(assert) {
  var validator = this.subject();
  let mockModel = Ember.Object.create({
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
  var validator = this.subject();
  let mockModel = Ember.Object.create({
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

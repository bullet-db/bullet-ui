/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import validateAggregationMaxSize from 'bullet-ui/validators/aggregation-max-size';
import { AGGREGATION_TYPES } from 'bullet-ui/utils/query-constants';

module('Unit | Validator | aggregation max size', function(hooks) {
  setupTest(hooks);

  test('it does not let you exceed the maximum aggregation size', function(assert) {
    var validate = validateAggregationMaxSize();
    let mockModel = EmberObject.create({
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP),
      settings: {
        defaultValues: {
          rawMaxSize: 100,
          aggregationMaxSize: 500
        }
      }
    });
    let expected = 'The maintainer has configured Bullet to support a maximum of 500 for result count';
    assert.equal(validate('size', 501, 20, { }, mockModel), expected);
    assert.ok(validate('size', 500, 20, { }, mockModel));
  });

  test('it does not let you exceed the maximum size for the Raw aggregation', function(assert) {
    var validate = validateAggregationMaxSize();
    let mockModel = EmberObject.create({
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW),
      settings: {
        defaultValues: {
          rawMaxSize: 100,
          aggregationMaxSize: 500
        }
      }
    });
    let expected = 'The maintainer has set the Raw type to support a maximum of 100 for result count';
    assert.equal(validate('size', 101, 20, { }, mockModel), expected);
    assert.ok(validate('size', 100, 20, { }, mockModel));
  });
});

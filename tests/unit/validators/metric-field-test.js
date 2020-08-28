/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import validateMetricField from 'bullet-ui/validators/metric-field';
import { METRIC_TYPES } from 'bullet-ui/utils/query-constants';

module('Unit | Validator | metric field', function(hooks) {
  setupTest(hooks);

  test('it checks to see if all metrics besides count have a field', function(assert) {
    let validate = validateMetricField();
    let mockModel = EmberObject.create({
      type: METRIC_TYPES.describe(METRIC_TYPES.SUM)
    });
    let expected = `All metrics but ${METRIC_TYPES.describe(METRIC_TYPES.COUNT)} require a field`;
    assert.equal(validate('field', null, null, mockModel, { }), expected);

    mockModel.set('type', METRIC_TYPES.describe(METRIC_TYPES.MIN));
    assert.equal(validate('field', null, null, { }, mockModel), expected);

    mockModel.set('type', METRIC_TYPES.describe(METRIC_TYPES.AVG));
    assert.equal(validate('field', null, null, mockModel, { }), expected);

    mockModel.set('type', METRIC_TYPES.describe(METRIC_TYPES.MAX));
    assert.equal(validate('field', null, null, { }, mockModel), expected);

    mockModel.set('type', METRIC_TYPES.describe(METRIC_TYPES.COUNT));
    assert.ok(validate('type', null, null, mockModel, { }));
    assert.ok(validate('type', null, null, { }, mockModel));
  });
});

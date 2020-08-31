/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import validatePoints from 'bullet-ui/validators/valid-points';
import { AGGREGATION_TYPES, DISTRIBUTION_TYPES, DISTRIBUTION_POINT_TYPES } from 'bullet-ui/utils/query-constants';

module('Unit | Validator | valid points', function(hooks) {
  setupTest(hooks);

  const SETTINGS = {
    defaultValues: {
      sketches: {
        distributionMaxNumberOfPoints: 20
      }
    }
  };

  test('it ignores non distribution type aggregations', function(assert) {
    let validate = validatePoints();
    let mockModel = EmberObject.create({
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW)
    });
    assert.ok(validate('type', null, null, { }, mockModel));
    mockModel.set('type', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT));
    assert.ok(validate('type', null, null, { }, mockModel));
  });

  test('it validates distribution type aggregations with a number of points', function(assert) {
    let validate = validatePoints();
    let expected;
    let mockModel = EmberObject.create({
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION),
      settings: SETTINGS,
      attributes: {
        pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER),
        type: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.PMF),
        numberOfPoints: null
      }
    });
    expected = 'You must specify the Number of Points you want to generate';
    assert.equal(validate('type', null, null, { }, mockModel), expected);

    mockModel.set('attributes.numberOfPoints', 21);
    expected = 'The maintainer has set the maximum number of points you can generate to be 20';
    assert.equal(validate('type', null, null, { }, mockModel), expected);

    mockModel.set('attributes.numberOfPoints', -1);
    expected = 'You must specify a positive Number of Points';
    assert.equal(validate('type', null, null, { }, mockModel), expected);

    mockModel.set('attributes.numberOfPoints', 15);
    assert.ok(validate('type', null, null, { }, mockModel));
  });

  test('it validates distribution type aggregations with generated points', function(assert) {
    let validate = validatePoints();
    let expected;
    let mockModel = EmberObject.create({
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION),
      settings: SETTINGS,
      attributes: {
        pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.GENERATED),
        type: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.PMF),
        start: 15,
        end: 500,
        increment: 50
      }
    });
    expected = 'You must specify the Start, End and Increment for the points you want to generate';
    mockModel.set('attributes.start', null);
    mockModel.set('attributes.end', null);
    mockModel.set('attributes.increment', null);
    assert.equal(validate('attributes.start', null, null, { }, mockModel), expected);

    mockModel.set('attributes.start', 15);
    assert.equal(validate('attributes.start', null, null, { }, mockModel), expected);

    mockModel.set('attributes.end', 500);
    assert.equal(validate('attributes.start', null, null, { }, mockModel), expected);

    mockModel.set('attributes.increment', 500);
    assert.ok(validate('attributes.start', null, null, { }, mockModel));

    expected = 'You must specify Start less than End';
    mockModel.set('attributes.start', 10);
    mockModel.set('attributes.end', 1);
    mockModel.set('attributes.increment', 2);
    assert.equal(validate('attributes.start', null, null, { }, mockModel), expected);

    expected = 'You must specify a positive Increment';
    mockModel.set('attributes.start', 1);
    mockModel.set('attributes.end', 10);
    mockModel.set('attributes.increment', 0);
    assert.equal(validate('attributes.start', null, null, { }, mockModel), expected);
    mockModel.set('attributes.increment', -1);
    assert.equal(validate('attributes.start', null, null, { }, mockModel), expected);

    expected = 'Quantiles requires that you specify a Start and End between 0 and 1';
    mockModel.set('attributes.start', -1);
    mockModel.set('attributes.end', 1);
    mockModel.set('attributes.increment', 0.1);
    mockModel.set('attributes.type', DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE));
    assert.equal(validate('attributes.type', null, null, { }, mockModel), expected);
    mockModel.set('attributes.end', 10);
    assert.equal(validate('attributes.end', null, null, { }, mockModel), expected);

    expected = 'The maintainer has set the maximum number of points you can generate to be 20';
    mockModel.set('attributes.start', 0);
    mockModel.set('attributes.end', 1);
    mockModel.set('attributes.increment', 0.01);
    assert.equal(validate('attributes.end', null, null, { }, mockModel), expected);

    mockModel.set('attributes.increment', 0.05);
    assert.ok(validate('attributes.increment', null, null, { }, mockModel));
  });

  test('it validates distribution type aggregations with free-form points', function(assert) {
    let validate = validatePoints();
    let expected;
    let mockModel = EmberObject.create({
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION),
      settings: SETTINGS,
      attributes: {
        pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.POINTS),
        type: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.PMF),
        points: ''
      }
    });
    expected = 'You must specify a comma separated list of points for this option';
    assert.equal(validate('attribute.pointType', null, null, { }, mockModel), expected);

    expected = 'These are not valid points: e,f';
    mockModel.set('attributes.points', '15, e, 235, 4, f, 0');
    assert.equal(validate('attribute.points', null, null, { }, mockModel), expected);

    expected = 'Quantiles requires points between 0 and 1. These are not: -0.4,1.2';
    mockModel.set('attributes.type', DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE));
    mockModel.set('attributes.points', '0.3, -0.4, 0.35, 0.4, 1.2, 0');
    assert.equal(validate('attribute.points', null, null, { }, mockModel), expected);

    expected = 'The maintainer has set the maximum number of points you can generate to be 5';
    mockModel.set('settings.defaultValues.sketches.distributionMaxNumberOfPoints', 5);
    mockModel.set('attributes.points', '0.3, 0.35, 0.4, 0, 0.6, 0.99');
    assert.equal(validate('attribute.points', null, null, { }, mockModel), expected);

    mockModel.set('attributes.points', '0.3, 0.4, 0, 0.6, 0.99');
    assert.ok(validate('attribute.points', null, null, { }, mockModel));
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { AGGREGATIONS, DISTRIBUTIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
import validatePoints from 'bullet-ui/validators/query-max-duration';

module('Unit | Validator | valid-points', function(hooks) {
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
      type: AGGREGATIONS.get('RAW')
    });
    assert.ok(validator.validate('type', null, null, mockModel, undefined));
    assert.ok(validator.validate('type', null, null, undefined, mockModel));
    mockModel.set('type', AGGREGATIONS.get('COUNT_DISTINCT'));
    assert.ok(validator.validate('type', null, null, mockModel, undefined));
  });

  test('it validates distribution type aggregations with a number of points', function(assert) {
    let validate = validatePoints();
    let expected;
    let mockModel = EmberObject.create({
      type: AGGREGATIONS.get('DISTRIBUTION'),
      settings: SETTINGS,
      attributes: {
        pointType: DISTRIBUTION_POINTS.get('NUMBER'),
        type: DISTRIBUTIONS.get('PMF'),
        numberOfPoints: null
      }
    });
    expected = 'You must specify the Number of Points you want to generate';
    assert.equal(validator.validate('type', null, null, mockModel, undefined), expected);

    mockModel.set('attributes.numberOfPoints', 21);
    expected = 'The maintainer has set the maximum number of points you can generate to be 20';
    assert.equal(validator.validate('type', null, null, mockModel, undefined), expected);

    mockModel.set('attributes.numberOfPoints', -1);
    expected = 'You must specify a positive Number of Points';
    assert.equal(validator.validate('type', null, null, mockModel, undefined), expected);

    mockModel.set('attributes.numberOfPoints', 15);
    assert.ok(validator.validate('type', null, null, mockModel, undefined));
  });

  test('it validates distribution type aggregations with generated points', function(assert) {
    let validate = validatePoints();
    let expected;
    let mockModel = EmberObject.create({
      type: AGGREGATIONS.get('DISTRIBUTION'),
      settings: SETTINGS,
      attributes: {
        pointType: DISTRIBUTION_POINTS.get('GENERATED'),
        type: DISTRIBUTIONS.get('PMF'),
        start: 15,
        end: 500,
        increment: 50
      }
    });
    expected = 'You must specify the Start, End and Increment for the points you want to generate';
    mockModel.set('attributes.start', null);
    mockModel.set('attributes.end', null);
    mockModel.set('attributes.increment', null);
    assert.equal(validator.validate('attributes.start', null, null, mockModel, undefined), expected);

    mockModel.set('attributes.start', 15);
    assert.equal(validator.validate('attributes.start', null, null, mockModel, undefined), expected);

    mockModel.set('attributes.end', 500);
    assert.equal(validator.validate('attributes.start', null, null, mockModel, undefined), expected);

    mockModel.set('attributes.increment', 500);
    assert.ok(validator.validate('attributes.start', null, null, mockModel, undefined));

    expected = 'You must specify Start less than End';
    mockModel.set('attributes.start', 10);
    mockModel.set('attributes.end', 1);
    mockModel.set('attributes.increment', 2);
    assert.equal(validator.validate('attributes.start', null, null, mockModel, undefined), expected);

    expected = 'You must specify a positive Increment';
    mockModel.set('attributes.start', 1);
    mockModel.set('attributes.end', 10);
    mockModel.set('attributes.increment', 0);
    assert.equal(validator.validate('attributes.start', null, null, mockModel, undefined), expected);
    mockModel.set('attributes.increment', -1);
    assert.equal(validator.validate('attributes.start', null, null, mockModel, undefined), expected);

    expected = 'Quantiles requires that you specify a Start and End between 0 and 1';
    mockModel.set('attributes.start', -1);
    mockModel.set('attributes.end', 1);
    mockModel.set('attributes.increment', 0.1);
    mockModel.set('attributes.type', DISTRIBUTIONS.get('QUANTILE'));
    assert.equal(validator.validate('attributes.type', null, null, mockModel, undefined), expected);
    mockModel.set('attributes.end', 10);
    assert.equal(validator.validate('attributes.end', null, null, mockModel, undefined), expected);

    expected = 'The maintainer has set the maximum number of points you can generate to be 20';
    mockModel.set('attributes.start', 0);
    mockModel.set('attributes.end', 1);
    mockModel.set('attributes.increment', 0.01);
    assert.equal(validator.validate('attributes.end', null, null, mockModel, undefined), expected);

    mockModel.set('attributes.increment', 0.05);
    assert.ok(validator.validate('attributes.increment', null, null, mockModel, undefined));
  });

  test('it validates distribution type aggregations with free-form points', function(assert) {
    let validate = validatePoints();
    let expected;
    let mockModel = EmberObject.create({
      type: AGGREGATIONS.get('DISTRIBUTION'),
      settings: SETTINGS,
      attributes: {
        pointType: DISTRIBUTION_POINTS.get('POINTS'),
        type: DISTRIBUTIONS.get('PMF'),
        points: ''
      }
    });
    expected = 'You must specify a comma separated list of points for this option';
    assert.equal(validator.validate('attribute.pointType' null, null, mockModel, undefined), expected);

    expected = 'These are not valid points: e,f';
    mockModel.set('attributes.points', '15, e, 235, 4, f, 0');
    assert.equal(validator.validate('attribute.points' null, null, mockModel, undefined), expected);

    expected = 'Quantiles requires points between 0 and 1. These are not: -0.4,1.2';
    mockModel.set('attributes.type', DISTRIBUTIONS.get('QUANTILE'));
    mockModel.set('attributes.points', '0.3, -0.4, 0.35, 0.4, 1.2, 0');
    assert.equal(validator.validate('attribute.points' null, null, mockModel, undefined), expected);

    expected = 'The maintainer has set the maximum number of points you can generate to be 5';
    mockModel.set('settings.defaultValues.sketches.distributionMaxNumberOfPoints', 5);
    mockModel.set('attributes.points', '0.3, 0.35, 0.4, 0, 0.6, 0.99');
    assert.equal(validator.validate('attribute.points' null, null, mockModel, undefined), expected);

    mockModel.set('attributes.points', '0.3, 0.4, 0, 0.6, 0.99');
    assert.ok(validator.validate('attribute.points' null, null, mockModel, undefined));
  });
});

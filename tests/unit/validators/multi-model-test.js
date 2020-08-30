/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { isEmpty } from '@ember/utils';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import validateMultiModelRelationships,
       { validateWindowAggregation, validateGroupMetricPresence, validateWindowEmitFrequency }
       from 'bullet-ui/validators/multi-model';
import { AGGREGATION_TYPES, EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/utils/query-constants';

module('Unit | Validator | multi model', function(hooks) {
  setupTest(hooks);

  test('it checks to see if grouped data has groups or metrics', function(assert) {
    let validate = validateGroupMetricPresence;
    let mockModel = EmberObject.create({
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP)
    });
    let groups, metrics;
    let expected = 'If you are grouping data, you must add at least one Group Field and/or Metric Field';
    assert.equal(validate(mockModel, null, null), expected);

    groups =  A([1, 2]);
    assert.ok(validate(mockModel, groups, null));

    groups = A();
    assert.equal(validate(mockModel, groups, null), expected);

    metrics = A([1, 2]);
    assert.ok(validate(mockModel, null, metrics));
  });

  test('it checks if the window is valid', function(assert) {
    let validate = validateWindowAggregation;
    const RAW = AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW);
    let aggregation = EmberObject.create({
      type: RAW
    });
    let window = EmberObject.create({
      includeType: INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW),
    });
    assert.ok(validate(window, aggregation));

    window.set('includeType', INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL));
    assert.equal(validate(window, aggregation), `The window should not include all from start when aggregation type is ${RAW}`);

    aggregation.set('type', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP));
    window.set('emitType', EMIT_TYPES.describe(EMIT_TYPES.RECORD));
    assert.equal(validate(window, aggregation), `The window should not be record based when aggregation type is not ${RAW}`);
  });

  test('it successfully validates when it has no window', function(assert) {
    let validate = validateWindowAggregation;
    let mockModel = EmberObject.create();
    assert.ok(validate(null, null, mockModel));
  });

  test('it does not let you exceed the query duration when it is time based window', function(assert) {
    let validate = validateWindowEmitFrequency;
    let query = EmberObject.create({
      duration: 20
    });
    let window = EmberObject.create({
      emitType: EMIT_TYPES.describe(EMIT_TYPES.TIME),
      emitEvery: 21
    });
    let settings = EmberObject.create();
    let expected = 'The window emit frequency should not be longer than the query duration (20 seconds)';
    assert.equal(validate(settings, query, window), expected);
    window.set('emitEvery', 20);
    assert.ok(validate(settings, query, window));
  });

  test('it does not let you exceed the minimum emit frequency when it is time based window', function(assert) {
    let validate = validateWindowEmitFrequency;
    let query = EmberObject.create({
      duration: 20
    });
    let window = EmberObject.create({
      emitType: EMIT_TYPES.describe(EMIT_TYPES.TIME),
      emitEvery: 9,
    });
    let settings = EmberObject.create({
      defaultValues: {
        windowEmitFrequencyMinSecs: 10
      }
    });
    let expected = 'The maintainer has configured Bullet to support a minimum of 10s for emit frequency';
    assert.equal(validate(settings, query, window), expected);
    window.set('emitEvery', 10);
    assert.ok(validate(settings, query, window));
  });

  test('it successfully validates when it is record based window', function(assert) {
    let validate = validateWindowEmitFrequency;
    let query = EmberObject.create({
      duration: 20
    });
    let window = EmberObject.create({
      emitType: EMIT_TYPES.describe(EMIT_TYPES.RECORD),
      emitEvery: 21
    });
    let settings = EmberObject.create();
    assert.ok(validate(settings, query, window));
    window.set('emitEvery', 20);
    assert.ok(validate(settings, query, window));
  });

  test('it validates all the given changesets for multiple model relationships', function(assert) {
    let validate = validateMultiModelRelationships;
    let query = EmberObject.create({
      duration: 20
    });
    let aggregation = EmberObject.create({
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP)
    });
    let window = EmberObject.create({
      emitType: EMIT_TYPES.describe(EMIT_TYPES.TIME),
      emitEvery: 9,
      includeType: INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL)
    });
    let metrics = A();
    let groups = A();
    let settings = EmberObject.create({
      defaultValues: {
        windowEmitFrequencyMinSecs: 10
      }
    });
    let result = validate(settings, { query, window, aggregation, groups, metrics });
    let expectedA = 'If you are grouping data, you must add at least one Group Field and/or Metric Field';
    let expectedB = 'The maintainer has configured Bullet to support a minimum of 10s for emit frequency';
    assert.equal(result.length, 2);
    assert.ok(result.indexOf(expectedA) !== -1);
    assert.ok(result.indexOf(expectedB) !== -1);

    groups = A([1])
    window.set('emitEvery', 10);
    result = validate(settings, { query, window, aggregation, groups, metrics });
    assert.ok(isEmpty(result));
  });
});

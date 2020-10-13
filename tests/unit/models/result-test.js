/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { run } from '@ember/runloop';
import { isPresent } from '@ember/utils';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { AGGREGATION_TYPES, EMIT_TYPES } from 'bullet-ui/utils/query-constants';

module('Unit | Model | result', function(hooks) {
  setupTest(hooks);

  test('it sets its default values right', function(assert) {
    let now = parseInt(Date.now());
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    let created = model.get('created');
    assert.ok(isPresent(created));
    assert.ok(parseInt(created.getTime()) >= now);
  });

  test('it recognizes a raw result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.RAW });
      assert.ok(model.get('isRaw'));
      assert.notOk(model.get('isReallyRaw'));
    });
  });

  test('it recognizes a really raw result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.RAW, isStarSelect: true });
      assert.ok(model.get('isRaw'));
      assert.ok(model.get('isReallyRaw'));
      assert.notOk(model.get('isSingleRow'));
    });
  });

  test('it recognizes a count distinct result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.COUNT_DISTINCT });
      assert.ok(model.get('isCountDistinct'));
      assert.ok(model.get('isSingleRow'));
    });
  });

  test('it recognizes a group by result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.GROUP, isGroupAll: false });
      assert.ok(model.get('isGroupBy'));
      assert.notOk(model.get('isGroupAll'));
      assert.notOk(model.get('isSingleRow'));
    });
  });

  test('it recognizes a group all result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.GROUP, isGroupAll: true });
      assert.ok(model.get('isGroupBy'));
      assert.ok(model.get('isSingleRow'));
    });
  });

  test('it recognizes a distribution result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.DISTRIBUTION });
      assert.ok(model.get('isDistribution'));
      assert.notOk(model.get('isSingleRow'));
    });
  });

  test('it recognizes a top k result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.TOP_K });
      assert.ok(model.get('isTopK'));
      assert.notOk(model.get('isSingleRow'));
    });
  });

  test('it recognizes a windowless result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.RAW });
      assert.ok(model.get('isTopK'));
      assert.ok(model.get('hasNoWindow'));
    });
  });

  test('it recognizes a windowed result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.RAW, emitType: EMIT_TYPES.RECORD });
      assert.ok(model.get('isRaw'));
      assert.notOk(model.get('hasNoWindow'));
      assert.notOk(model.get('isTimeWindow'));
    });
  });

  test('it recognizes a time windowed result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.RAW, emitType: EMIT_TYPES.TIME });
      assert.ok(model.get('isRaw'));
      assert.notOk(model.get('hasNoWindow'));
      assert.ok(model.get('isTimeWindow'));
    });
  });

  test('it can provide a window interval', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('categorization', { type: AGGREGATION_TYPES.RAW, emitType: EMIT_TYPES.TIME, emitEvery: 1000 });
      assert.ok(model.get('isRaw'));
      assert.notOk(model.get('hasNoWindow'));
      assert.ok(model.get('isTimeWindow'));
      assert.equal(model.get('windowEmitEvery'), 1000);
    });
  });
});

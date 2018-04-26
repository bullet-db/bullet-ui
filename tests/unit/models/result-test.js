/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { run } from '@ember/runloop';
import { isPresent } from '@ember/utils';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

module('Unit | Model | result', function(hooks) {
  setupTest(hooks);

  test('it sets its default values right', function(assert) {
    let now = parseInt(Date.now());
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    let created = model.get('created');
    assert.equal(Object.keys(model.get('metadata')).length, 0);
    assert.equal(model.get('records').length, 0);
    assert.ok(isPresent(created));
    assert.ok(parseInt(created.getTime()) >= now);
  });

  test('it recognizes a raw result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('querySnapshot', { type: AGGREGATIONS.get('RAW') });
      assert.ok(model.get('isRaw'));
      assert.notOk(model.get('isReallyRaw'));
    });
  });

  test('it recognizes a really raw result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('querySnapshot', { type: AGGREGATIONS.get('RAW'), projectionsSize: 0 });
      assert.ok(model.get('isRaw'));
      assert.ok(model.get('isReallyRaw'));
      assert.notOk(model.get('isSingleRow'));
    });
  });

  test('it recognizes a count distinct result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('querySnapshot', { type: AGGREGATIONS.get('COUNT_DISTINCT') });
      assert.ok(model.get('isCountDistinct'));
      assert.ok(model.get('isSingleRow'));
    });
  });

  test('it recognizes a group by result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('querySnapshot', { type: AGGREGATIONS.get('GROUP'), groupsSize: 2, metricsSize: 2 });
      assert.ok(model.get('isGroupBy'));
      assert.notOk(model.get('isGroupAll'));
      assert.notOk(model.get('isSingleRow'));
    });
    run(() => {
      model.set('querySnapshot', { type: AGGREGATIONS.get('GROUP'), groupsSize: 1, metricsSize: 1 });
      assert.ok(model.get('isGroupBy'));
      assert.notOk(model.get('isGroupAll'));
      assert.notOk(model.get('isSingleRow'));
    });
  });

  test('it recognizes a group all result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('querySnapshot', { type: AGGREGATIONS.get('GROUP'), groupsSize: 0 });
      assert.notOk(model.get('isGroupBy'));
      assert.ok(model.get('isGroupAll'));
      assert.ok(model.get('isSingleRow'));
    });
  });

  test('it recognizes a distribution result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('querySnapshot', { type: AGGREGATIONS.get('DISTRIBUTION') });
      assert.ok(model.get('isDistribution'));
      assert.notOk(model.get('isSingleRow'));
    });
  });

  test('it recognizes a top k result type', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('result'));
    run(() => {
      model.set('querySnapshot', { type: AGGREGATIONS.get('TOP_K') });
      assert.ok(model.get('isTopK'));
      assert.notOk(model.get('isSingleRow'));
    });
  });
});

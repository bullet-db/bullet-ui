/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { isPresent, isEmpty } from '@ember/utils';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import QUERIES from 'bullet-ui/tests/fixtures/queries';

module('Unit | Model | bql', function(hooks) {
  setupTest(hooks);

  test('it sets its default values right', function(assert) {
    let now = parseInt(Date.now());
    let model = run(() => this.owner.lookup('service:store').createRecord('bql'));
    let created = model.get('created');
    assert.notOk(isPresent(model.get('name')));
    assert.ok(parseInt(created.getTime()) >= now);
  });

  test('it can fail to convert itself to an object', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('bql', { name: 'foo', query: 'garbage' }));
    assert.notOk(isPresent(model.get('builderQuery')));
  });

  test('it can convert itself to an object', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('bql', { name: 'f', query: QUERIES.ALL_SIMPLE }));
    let object = model.get('builderQuery');
    assert.notOk(isEmpty(object.get('filter.summary')));
    assert.equal(object.get('aggregation.size'), 10);
    assert.equal(object.get('duration'), 10000);
    assert.equal(object.get('name'), 'f');
  });
});

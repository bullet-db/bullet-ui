/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { run } from '@ember/runloop';
import { isPresent } from '@ember/utils';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | segment', function(hooks) {
  setupTest(hooks);

  test('it sets its default values right', function(assert) {
    let now = parseInt(Date.now());
    let model = run(() => this.owner.lookup('service:store').createRecord('segment'));
    let created = model.get('created');
    assert.equal(Object.keys(model.get('metadata')).length, 0);
    assert.equal(model.get('records').length, 0);
    assert.ok(isPresent(created));
    assert.ok(parseInt(created.getTime()) >= now);
  });
});

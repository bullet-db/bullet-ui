/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { isPresent } from '@ember/utils';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | query', function(hooks) {
  setupTest(hooks);

  test('it sets its default values right', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('query'));
    assert.notOk(isPresent(model.get('name')));
    assert.equal(model.get('duration'), 20000);
  });
});

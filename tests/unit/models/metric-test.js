/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { METRIC_TYPES } from 'bullet-ui/utils/query-constants';

module('Unit | Model | metric', function(hooks) {
  setupTest(hooks);

  test('it defaults to summing', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('metric'));
    assert.equal(model.get('type'), METRIC_TYPES.describe(METRIC_TYPES.SUM));
  });
});

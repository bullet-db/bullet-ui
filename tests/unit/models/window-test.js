/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';

module('Unit | Model | window', function(hooks) {
  setupTest(hooks);

  test('it sets its default values right', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('window'));
    assert.equal(model.get('emit.type'), EMIT_TYPES.get('TIME'));
    assert.equal(model.get('emit.every'), 2);
    assert.equal(model.get('include.type'), INCLUDE_TYPES.get('WINDOW'));
  });

  test('it maps the api types for the emit types properly', function(assert) {
    assert.equal(EMIT_TYPES.apiKey('Time Based'), 'TIME');
    assert.equal(EMIT_TYPES.apiKey('Record Based'), 'RECORD');
  });

  test('it maps the api types for the include types properly', function(assert) {
    assert.equal(INCLUDE_TYPES.apiKey('Everything from Start'), 'ALL');
  });
});

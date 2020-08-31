/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/utils/query-constants';

module('Unit | Model | window', function(hooks) {
  setupTest(hooks);

  test('it sets its default values right', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('window'));
    assert.equal(model.get('emitType'), EMIT_TYPES.describe(EMIT_TYPES.TIME));
    assert.equal(model.get('emitEvery'), 2);
    assert.equal(model.get('includeType'), INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW));
  });

  test('it maps the names for the emit types properly', function(assert) {
    assert.equal(EMIT_TYPES.name(EMIT_TYPES.describe(EMIT_TYPES.TIME)), EMIT_TYPES.forSymbol(EMIT_TYPES.TIME));
    assert.equal(EMIT_TYPES.name(EMIT_TYPES.describe(EMIT_TYPES.RECORD)), EMIT_TYPES.forSymbol(EMIT_TYPES.RECORD));
  });

  test('it maps the names for the include types properly', function(assert) {
    assert.equal(INCLUDE_TYPES.name(INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL)), INCLUDE_TYPES.forSymbol(INCLUDE_TYPES.ALL));
  });
});

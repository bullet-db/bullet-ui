/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';

module('Unit | Validator | valid-window', function(hooks) {
  setupTest(hooks);

  test('it checks if the window is valid', function(assert) {
    assert.expect(3);

    var validator = this.owner.lookup('validator:valid-window');
    let aggregation = EmberObject.create({
      type: AGGREGATIONS.get('RAW')
    });
    let window = EmberObject.create({
      include: {
        type: INCLUDE_TYPES.get('WINDOW')
      }
    });
    let mockModel = EmberObject.create({
      aggregation: aggregation,
      window: window
    });
    assert.ok(validator.validate(null, null, mockModel));

    mockModel.get('window').set('include', { type: INCLUDE_TYPES.get('ALL') });
    assert.equal(validator.validate(null, null, mockModel), 'The window should not include all from start when aggregation type is Raw');

    mockModel.get('aggregation').set('type', AGGREGATIONS.get('GROUP'));
    mockModel.get('window').set('emit', { type: EMIT_TYPES.get('RECORD') });
    assert.equal(validator.validate(null, null, mockModel), 'The window should not be record based when aggregation type is not Raw');
  });

  test('it successfully validates when it has no window', function(assert) {
    var validator = this.owner.lookup('validator:valid-window');
    let mockModel = EmberObject.create();
    assert.ok(validator.validate(null, null, mockModel));
  });
});

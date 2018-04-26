/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

module('Unit | Validator | group-metric-presence', function(hooks) {
  setupTest(hooks);

  test('it checks to see if grouped data has groups or metrics', function(assert) {
    var validator = this.owner.lookup('validator:group-metric-presence');
    let mockModel = EmberObject.create({
      type: AGGREGATIONS.get('GROUP')
    });
    let expected = 'If you are grouping data, you must add at least one Group Field and/or Metric Field';
    assert.equal(validator.validate(null, null, mockModel), expected);

    mockModel.set('groups', A([1, 2]));
    assert.ok(validator.validate(null, null, mockModel));

    mockModel.set('groups', A());
    assert.equal(validator.validate(null, null, mockModel), expected);

    mockModel.set('metrics', A([1, 2]));
    assert.ok(validator.validate(null, null, mockModel));
  });
});

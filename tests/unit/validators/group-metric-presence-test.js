/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

moduleFor('validator:group-metric-presence', 'Unit | Validator | group-metric-presence', {
  needs: ['validator:messages']
});

test('it checks to see if grouped data has groups or metrics', function(assert) {
  var validator = this.subject();
  let mockModel = Ember.Object.create({
    type: AGGREGATIONS.get('GROUP')
  });
  let expected = 'If you are grouping data, you must add at least one Group Field and/or Metric Field';
  assert.equal(validator.validate(null, null, mockModel), expected);

  mockModel.set('groups', Ember.A([1, 2]));
  assert.ok(validator.validate(null, null, mockModel));

  mockModel.set('groups', Ember.A());
  assert.equal(validator.validate(null, null, mockModel), expected);

  mockModel.set('metrics', Ember.A([1, 2]));
  assert.ok(validator.validate(null, null, mockModel));
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

moduleFor('validator:count-distinct-field-presence', 'Unit | Validator | count-distinct-field-presence', {
  needs: ['validator:messages']
});

test('it checks to see if count distinct has fields', function(assert) {
  var validator = this.subject();
  let mockModel = Ember.Object.create({
    type: AGGREGATIONS.get('COUNT_DISTINCT')
  });
  assert.equal(validator.validate(null, null, mockModel),
               'If you are counting distincts, you must add at least one Field to count distinct on');
  mockModel.set('groups', Ember.A([1, 2]));
  assert.ok(validator.validate(null, null, mockModel));
});

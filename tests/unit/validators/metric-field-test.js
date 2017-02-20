/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { METRICS } from 'bullet-ui/models/metric';

moduleFor('validator:metric-field', 'Unit | Validator | metric-field', {
  needs: ['validator:messages']
});

test('it checks to see if all metrics besides count have a field', function(assert) {
  var validator = this.subject();
  let mockModel = Ember.Object.create({
    type: METRICS.get('SUM')
  });
  let expected = `All metrics but ${METRICS.get('COUNT')} require a field`;
  assert.equal(validator.validate(null, null, mockModel), expected);

  mockModel.set('type', METRICS.get('MIN'));
  assert.equal(validator.validate(null, null, mockModel), expected);

  mockModel.set('type', METRICS.get('AVG'));
  assert.equal(validator.validate(null, null, mockModel), expected);

  mockModel.set('type', METRICS.get('MAX'));
  assert.equal(validator.validate(null, null, mockModel), expected);

  mockModel.set('type', METRICS.get('COUNT'));
  assert.ok(validator.validate(null, null, mockModel));
});

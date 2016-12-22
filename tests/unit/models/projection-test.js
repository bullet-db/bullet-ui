/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('projection', 'Unit | Model | projection', {
  needs: ['model:query']
});

test('it sets its default values right', function(assert) {
  let model = this.subject();
  assert.ok(!Ember.isPresent(model.get('field')));
  assert.ok(!Ember.isPresent(model.get('name')));
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('result', 'Unit | Model | result', {
  needs: ['model:query']
});

test('it sets its default values right', function(assert) {
  let now = parseInt(Date.now());
  let model = this.subject();
  let created = model.get('created');
  assert.equal(Object.keys(model.get('metadata')).length, 0);
  assert.equal(model.get('records').length, 0);
  assert.ok(Ember.isPresent(created));
  assert.ok(parseInt(created.getTime()) >= now);
});


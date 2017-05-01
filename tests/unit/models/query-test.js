/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('query', 'Unit | Model | query', {
  needs: ['model:filter', 'model:projection', 'model:aggregation', 'model:result',
          'validator:presence', 'validator:belongsTo', 'validator:hasMany',
          'validator:number', 'validator:queryMaxDuration']
});

test('it sets its default values right', function(assert) {
  let now = parseInt(Date.now());
  let model = this.subject();
  let created = model.get('created');
  assert.ok(!Ember.isPresent(model.get('name')));
  assert.equal(model.get('duration'), 20);
  assert.ok(parseInt(created.getTime()) >= now);
});

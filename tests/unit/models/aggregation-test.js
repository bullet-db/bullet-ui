/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForModel, test } from 'ember-qunit';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

moduleForModel('aggregation', 'Unit | Model | aggregation', {
  needs: ['model:query']
});

test('it sets its default values right', function(assert) {
  let model = this.subject();
  assert.equal(model.get('type'), AGGREGATIONS.get('LIMIT'));
  assert.equal(model.get('size'), 1);
});

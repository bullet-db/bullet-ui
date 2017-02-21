/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForModel, test } from 'ember-qunit';
import { METRICS } from 'bullet-ui/models/metric';

moduleForModel('metric', 'Unit | Model | metric', {
  needs: ['model:aggregation', 'validator:belongsTo', 'validator:metricField']
});

test('it defaults to summing', function(assert) {
  let model = this.subject();
  assert.equal(model.get('type'), METRICS.get('SUM'));
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForModel, test } from 'ember-qunit';
import { AGGREGATIONS, DISTRIBUTIONS } from 'bullet-ui/models/aggregation';

moduleForModel('aggregation', 'Unit | Model | aggregation', {
  needs: ['model:query', 'model:group', 'model:metric',
          'validator:presence', 'validator:belongsTo', 'validator:hasMany',
          'validator:number', 'validator:aggregationMaxSize',
          'validator:validPoints', 'validator:groupMetricPresence']
});

test('it sets its default values right', function(assert) {
  let model = this.subject();
  assert.equal(model.get('type'), AGGREGATIONS.get('RAW'));
  assert.equal(model.get('size'), 1);
});

test('it maps the api types for the aggregation types properly', function(assert) {
  assert.equal(AGGREGATIONS.apiKey('Raw'), 'RAW');
  assert.equal(AGGREGATIONS.apiKey('Group'), 'GROUP');
  assert.equal(AGGREGATIONS.apiKey('Count Distinct'), 'COUNT DISTINCT');
  assert.equal(AGGREGATIONS.apiKey('Distribution'), 'DISTRIBUTION');
  assert.equal(AGGREGATIONS.apiKey('Top K'), 'TOP K');
});

test('it maps the api types for the distribution types properly', function(assert) {
  assert.equal(DISTRIBUTIONS.apiKey('Quantile'), 'QUANTILE');
  assert.equal(DISTRIBUTIONS.apiKey('Frequency'), 'PMF');
  assert.equal(DISTRIBUTIONS.apiKey('Cumulative Frequency'), 'CDF');
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { AGGREGATIONS, DISTRIBUTIONS } from 'bullet-ui/models/aggregation';
import { run } from '@ember/runloop';

module('Unit | Model | aggregation', function(hooks) {
  setupTest(hooks);

  test('it sets its default values right', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('aggregation'));
    assert.ok(model.get('attributes'));
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
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { AGGREGATION_TYPES, DISTRIBUTION_TYPES } from 'bullet-ui/utils/query-constants';

module('Unit | Model | aggregation', function(hooks) {
  setupTest(hooks);

  test('it maps the names for the aggregation types properly', function(assert) {
    assert.equal(
      AGGREGATION_TYPES.name(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW)),
      AGGREGATION_TYPES.forSymbol(AGGREGATION_TYPES.RAW)
    );
    assert.equal(
      AGGREGATION_TYPES.name(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT)),
      AGGREGATION_TYPES.forSymbol(AGGREGATION_TYPES.COUNT_DISTINCT)
    );
    assert.equal(
      AGGREGATION_TYPES.name(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP)),
      AGGREGATION_TYPES.forSymbol(AGGREGATION_TYPES.GROUP)
    );
    assert.equal(
      AGGREGATION_TYPES.name(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION)),
      AGGREGATION_TYPES.forSymbol(AGGREGATION_TYPES.DISTRIBUTION)
    );
    assert.equal(
      AGGREGATION_TYPES.name(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K)),
      AGGREGATION_TYPES.forSymbol(AGGREGATION_TYPES.TOP_K)
    );
  });

  test('it maps the names for the distribution types properly', function(assert) {
    assert.equal(
      DISTRIBUTION_TYPES.name(DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE)),
      DISTRIBUTION_TYPES.forSymbol(DISTRIBUTION_TYPES.QUANTILE)
    );
    assert.equal(
      DISTRIBUTION_TYPES.name(DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.FREQ)),
      DISTRIBUTION_TYPES.forSymbol(DISTRIBUTION_TYPES.FREQ)
    );
    assert.equal(
      DISTRIBUTION_TYPES.name(DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.CUMFREQ)),
      DISTRIBUTION_TYPES.forSymbol(DISTRIBUTION_TYPES.CUMFREQ)
    );
  });
});

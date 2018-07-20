/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import QUERIES from '../fixtures/queries';
import { setupForAcceptanceTest, setupForMockSettings } from '../helpers/setup-for-acceptance-test';
import { visit, findAll } from '@ember/test-helpers';
import { findIn, findAllIn } from '../helpers/find-helpers';

module('Acceptance | query default query', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.BASIC);
  setupForMockSettings(hooks, QUERIES.AND_LIST_TUMBLING_WINDOW);

  test('it creates new queries with two default filters', async function(assert) {
    assert.expect(7);
    await visit('/queries/new');

    assert.equal(findAll('.filter-container .builder .rules-list .rule-container').length, 2);
    assert.equal(findIn('.rule-filter-container select', findAll('.filter-container .builder .rules-list .rule-container')[0]).value,
      'complex_list_column');
    assert.equal(findIn('.rule-operator-container select', findAll('.filter-container .builder .rules-list .rule-container')[0]).value, 'is_not_null');
    assert.equal(findAllIn('.rule-value-container input', findAll('.filter-container .builder .rules-list .rule-container')[0]).length, 0);
    assert.equal(findIn('.rule-filter-container select', findAll('.filter-container .builder .rules-list .rule-container')[1]).value, 'simple_column');
    assert.equal(findIn('.rule-operator-container select', findAll('.filter-container .builder .rules-list .rule-container')[1]).value, 'in');
    assert.equal(findIn('.rule-value-container input', findAll('.filter-container .builder .rules-list .rule-container')[1]).value, 'foo,bar');
  });
});

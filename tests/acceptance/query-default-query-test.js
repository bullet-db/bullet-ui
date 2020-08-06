/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import QUERIES from 'bullet-ui/tests/fixtures/queries';
import { setupForAcceptanceTest, setupForMockSettings } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { visit, find, findAll } from '@ember/test-helpers';
import { findIn, findAllIn } from 'bullet-ui/tests/helpers/find-helpers';

module('Acceptance | query default query', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.BASIC);
  setupForMockSettings(hooks, QUERIES.AND_LIST_TUMBLING_WINDOW);

  test('it creates new queries with two default filters', async function(assert) {
    assert.expect(10);
    await visit('/queries/new');

    assert.dom('.filter-container .builder .rules-list .rule-container').exists({ count: 2 });

    let rules = findAll('.filter-container .builder .rules-list .rule-container');
    assert.dom(findIn('.rule-filter-container select', rules[0])).hasValue('complex_list_column');
    assert.dom(findIn('.rule-operator-container select', rules[0])).hasValue('is_not_null');
    assert.equal(findAllIn('.rule-value-container input', rules[0]).length, 0);
    assert.dom(findIn('.rule-filter-container select', rules[1])).hasValue('simple_column');
    assert.dom(findIn('.rule-operator-container select', rules[1])).hasValue('in');
    assert.dom(findIn('.rule-value-container input', rules[1])).hasValue('foo,bar');
    assert.dom('.window-container .window-emit-every input').hasValue('2');
    assert.dom('.window-container .window-size input').hasValue('1');
    assert.dom('.options-container .query-duration input').hasValue('20');
  });
});

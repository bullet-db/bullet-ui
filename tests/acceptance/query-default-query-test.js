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
import { visit, findAll } from '@ember/test-helpers';
import { findIn } from 'bullet-ui/tests/helpers/find-helpers';

module('Acceptance | query default query', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.BASIC);
  setupForMockSettings(hooks, QUERIES.BASIC_AND_LIST_TUMBLING_WINDOW);

  test('it creates an empty builder query if the provided query is bad', async function(assert) {
    assert.expect(3);
    let settings = this.owner.lookup('settings:mocked');
    settings.set('defaultQuery', 'garbage');
    await visit('/queries/build');
    assert.dom('.filter-container .builder .rules-list .rule-container').doesNotExist();
    assert.dom('.window-container .window-emit-every').doesNotExist();
    assert.dom('.options-container .query-duration input').hasValue('20');
  });

  test('it creates a new builder query with two default filters', async function(assert) {
    assert.expect(10);
    await visit('/queries/build');

    assert.dom('.filter-container .builder .rules-list .rule-container').exists({ count: 2 });
    let rules = findAll('.filter-container .builder .rules-list .rule-container');
    assert.dom(findIn('.rule-filter-container select', rules[0])).hasValue('complex_list_column');
    assert.dom(findIn('.rule-operator-container select', rules[0])).hasValue('contains_value');
    assert.dom(findIn('.rule-value-container input', rules[0])).hasValue("foo");
    assert.dom(findIn('.rule-filter-container select', rules[1])).hasValue('simple_column');
    assert.dom(findIn('.rule-operator-container select', rules[1])).hasValue('rlike');
    assert.dom(findIn('.rule-value-container input', rules[1])).hasValue('.foo.+,.*bar$');

    assert.dom('.window-container .window-emit-every input').hasValue('2');
    assert.dom('.window-container .window-size input').hasValue('1');
    assert.dom('.options-container .query-duration input').hasValue('20');
  });

  test('it creates an empty bql query if the provided query is bad', async function(assert) {
    assert.expect(1);
    let settings = this.owner.lookup('settings:mocked');
    settings.set('defaultQuery', 'garbage');
    await visit('/queries/bql');
    assert.dom('.query-panel .editor').includesText('1garbage' );
  });

  test('it creates new bql query with two default filters', async function(assert) {
    assert.expect(1);
    await visit('/queries/bql');

    assert.dom('.query-panel .editor').includesText(
      '1SELECT * FROM STREAM(20000, TIME) ' +
      'WHERE CONTAINSVALUE(complex_list_column, "foo") AND simple_column RLIKE ANY [".foo.+", ".*bar$"] ' +
      'WINDOWING TUMBLING(2000, TIME) ' +
      'LIMIT 1'
    );
  });

});

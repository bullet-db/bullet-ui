/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import QUERIES from 'bullet-ui/tests/fixtures/queries';
import { textWrap } from 'bullet-ui/tests/helpers/pretender';
import MockedAPI from 'bullet-ui/tests/helpers/mocked-api';
import sinon from 'sinon';
import Stomp from '@stomp/stompjs';
import { basicSetupForAcceptanceTest, setupForMockSettings } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { visit, findAll } from '@ember/test-helpers';
import { findIn } from 'bullet-ui/tests/helpers/find-helpers';

let url = 'http://foo.bar.com/api/custom-query';
let hit = 0;

module('Acceptance | query default query api', function(hooks) {
  basicSetupForAcceptanceTest(hooks);
  setupForMockSettings(hooks, url);

  hooks.beforeEach(function() {
    this.mockedAPI = new MockedAPI();
    this.stub = sinon.stub(Stomp, 'over').returns(this.mockedAPI);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    // Extend regular API with a filter endpoint
    hit = 0;
    this.mockedAPI.server.map(function() {
      this.get(url, () => {
        hit++;
        return textWrap(200, QUERIES.BASIC_AND_ENUMERATED_COUNT_DISTINCT);
      });
    });
  });

  hooks.afterEach(function() {
    this.mockedAPI.shutdown();
    this.stub.restore();
  });

  test('it creates new builder queries with three default filters and the count distinct aggregation', async function(assert) {
    assert.expect(13);
    await visit('/queries/build');

    assert.dom('.filter-container .builder .rules-list .rule-container').exists({ count: 3 });

    let rules = findAll('.filter-container .builder .rules-list .rule-container');
    assert.dom(findIn('.rule-filter-container select', rules[0])).hasValue('enumerated_map_column.nested_1');
    assert.dom(findIn('.rule-operator-container select', rules[0])).hasValue('not_in');
    assert.dom(findIn('.rule-value-container input', rules[0])).hasValue('1,2,3');
    assert.dom(findIn('.rule-filter-container select', rules[1])).hasValue('simple_column');
    assert.dom(findIn('.rule-operator-container select', rules[1])).hasValue('size_is');
    assert.dom(findIn('.rule-value-container input', rules[1])).hasValue('15');
    assert.dom(findIn('.rule-filter-container select', rules[2])).hasValue('enumerated_map_column');
    assert.dom(findIn('.rule-operator-container select', rules[2])).hasValue('contains_key');
    assert.dom(findIn('.rule-value-container input', rules[2])).hasValue('bar');

    let field = findAll('.output-container .field-selection-container')[0];
    assert.dom(findIn('.column-only-field .ember-power-select-selected-item', field)).hasText('simple_column');
    assert.dom('.output-container .count-distinct-display-name input').hasValue('');
    assert.dom('.options-container .query-duration input').hasValue('50');
  });


  test('it creates new bql queries with three default filters and the count distinct aggregation', async function(assert) {
    assert.expect(1);
    await visit('/queries/bql');

    assert.dom('.query-panel .editor').includesText(
      '1SELECT COUNT(DISTINCT simple_column) ' +
      'FROM STREAM(50000, TIME) ' +
      'WHERE enumerated_map_column.nested_1 NOT IN ["1", "2", "3"] AND SIZEIS(simple_column, 15) AND ' +
              'CONTAINSKEY(enumerated_map_column, "bar");'
    );
  });

  test('it reuses fetched values when creating new builder queries', async function(assert) {
    assert.expect(1);
    await visit('/queries/build');
    await visit('/queries/build');
    await visit('/queries/build');
    assert.equal(hit, 1);
  });

  test('it reuses fetched values when creating new bql queries', async function(assert) {
    assert.expect(1);
    await visit('/queries/bql');
    await visit('/queries/bql');
    await visit('/queries/bql');
    assert.equal(hit, 1);
  });
});

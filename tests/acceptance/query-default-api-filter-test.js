/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import FILTERS from '../fixtures/filters';
import { jsonWrap } from '../helpers/pretender';
import mockedAPI from '../helpers/mocked-api';
import sinon from 'sinon';
import Stomp from 'npm:@stomp/stompjs';
import { basicSetupForAcceptanceTest, setupForMockSettings } from '../helpers/setup-for-acceptance-test';
import { visit, findAll } from '@ember/test-helpers';
import { findIn } from '../helpers/find-helpers';

let url = 'http://foo.bar.com/api/filter';
let hit = 0;

module('Acceptance | query default api filter', function(hooks) {
  basicSetupForAcceptanceTest(hooks);
  setupForMockSettings(hooks, url);

  hooks.beforeEach(function() {
    this.mockedAPI = mockedAPI.create();
    this.stub = sinon.stub(Stomp, 'over').returns(this.mockedAPI);
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
    // Extend regular API with a filter endpoint
    hit = 0;
    this.mockedAPI.get('server').map(function() {
      this.get(url, () => {
        hit++;
        return jsonWrap(200, FILTERS.AND_ENUMERATED);
      });
    });
  });

  hooks.afterEach(function() {
    this.mockedAPI.shutdown();
    this.stub.restore();
  });

  test('it creates new queries with two default filters', async function(assert) {
    assert.expect(7);
    await visit('/queries/new');
    assert.equal(findAll('.filter-container .builder .rules-list .rule-container').length, 2);
    assert.equal(findIn('.rule-filter-container select', findAll('.filter-container .builder .rules-list .rule-container')[0]).value,
      'enumerated_map_column.nested_1');
    assert.equal(findIn('.rule-operator-container select', findAll('.filter-container .builder .rules-list .rule-container')[0]).value, 'not_in');
    assert.equal(findIn('.rule-value-container input', findAll('.filter-container .builder .rules-list .rule-container')[0]).value, '1,2,3');
    assert.equal(findIn('.rule-filter-container select', findAll('.filter-container .builder .rules-list .rule-container')[1]).value, 'simple_column');
    assert.equal(findIn('.rule-operator-container select', findAll('.filter-container .builder .rules-list .rule-container')[1]).value, 'in');
    assert.equal(findIn('.rule-value-container input', findAll('.filter-container .builder .rules-list .rule-container')[1]).value, 'foo,bar');
  });

  test('it reuses fetched values when creating new queries', async function(assert) {
    assert.expect(1);
    await visit('/queries/new');
    await visit('/queries/new');
    await visit('/queries/new');
    assert.equal(hit, 1);
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import FILTERS from '../fixtures/filters';
import { jsonWrap } from '../helpers/pretender';
import setupForAcceptanceTest from '../helpers/setup-for-acceptance-test';
import { visit } from '@ember/test-helpers';
import $ from 'jquery';

let url = 'http://foo.bar.com/api/filter';
let hit = 0;

module('Acceptance | query default api filter', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.BASIC);

  hooks.beforeEach(function() {
    // Inject into defaultValues in routes, our mock filter values
    this.owner.register('settings:mocked', EmberObject.create({ defaultFilter: url }), { instantiate: false });
    this.owner.inject('route', 'settings', 'settings:mocked');

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
    this.owner.unregister('settings:mocked');
  });

  test('it creates new queries with two default filters', async function(assert) {
    assert.expect(7);
    await visit('/queries/new');
    assert.equal($('.filter-container .builder .rules-list .rule-container').length, 2);
    assert.equal($('.filter-container .builder .rules-list .rule-container').first().find('.rule-filter-container select').val(),
      'enumerated_map_column.nested_1');
    assert.equal($('.filter-container .builder .rules-list .rule-container').first().find('.rule-operator-container select').val(), 'not_in');
    assert.equal($('.filter-container .builder .rules-list .rule-container').first().find('.rule-value-container input').val(), '1,2,3');
    assert.equal($('.filter-container .builder .rules-list .rule-container').last().find('.rule-filter-container select').val(), 'simple_column');
    assert.equal($('.filter-container .builder .rules-list .rule-container').last().find('.rule-operator-container select').val(), 'in');
    assert.equal($('.filter-container .builder .rules-list .rule-container').last().find('.rule-value-container input').val(), 'foo,bar');
  });

  test('it reuses fetched values when creating new queries', async function(assert) {
    assert.expect(1);
    await visit('/queries/new');
    await visit('/queries/new');
    await visit('/queries/new');
    assert.equal(hit, 1);
  });
});

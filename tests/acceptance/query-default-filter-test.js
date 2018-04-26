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
import setupForAcceptanceTest from '../helpers/setup-for-acceptance-test';
import { visit } from '@ember/test-helpers';
import $ from 'jquery';

module('Acceptance | query default filter', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.BASIC);

  hooks.beforeEach(async function() {
    // Inject into defaultValues in routes, our mock filter values
    this.owner.register('settings:mocked', EmberObject.create({ defaultFilter: FILTERS.AND_LIST }), { instantiate: false });
    this.owner.inject('route', 'settings', 'settings:mocked');
  });

  hooks.afterEach(async function() {
    this.owner.unregister('settings:mocked');
  });

  test('it creates new queries with two default filters', async function(assert) {
    assert.expect(7);
    await visit('/queries/new');

    assert.equal($('.filter-container .builder .rules-list .rule-container').length, 2);
    assert.equal($('.filter-container .builder .rules-list .rule-container').first().find('.rule-filter-container select').val(),
      'complex_list_column');
    assert.equal($('.filter-container .builder .rules-list .rule-container').first().find('.rule-operator-container select').val(), 'is_not_null');
    assert.notOk($('.filter-container .builder .rules-list .rule-container').first().find('.rule-value-container input').val());
    assert.equal($('.filter-container .builder .rules-list .rule-container').last().find('.rule-filter-container select').val(), 'simple_column');
    assert.equal($('.filter-container .builder .rules-list .rule-container').last().find('.rule-operator-container select').val(), 'in');
    assert.equal($('.filter-container .builder .rules-list .rule-container').last().find('.rule-value-container input').val(), 'foo,bar');
  });
});

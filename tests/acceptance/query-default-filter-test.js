/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import FILTERS from '../fixtures/filters';

moduleForAcceptance('Acceptance | query default filter', {
  suppressLogging: true,

  beforeEach() {
    // Inject into defaultValues in routes, our mock filter values
    this.application.register('settings:mocked', Ember.Object.create({ defaultFilter: FILTERS.AND_LIST }), { instantiate: false });
    this.application.inject('route', 'settings', 'settings:mocked');

    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
  },

  afterEach() {
    // Wipe out localstorage because we are creating here
    window.localStorage.clear();
  }
});

test('it creates new queries with two default filters', function(assert) {
  assert.expect(7);
  visit('/queries/new');

  andThen(function() {
    assert.equal(find('.filter-container .builder .rules-list li').length, 2);
    assert.equal(find('.filter-container .builder .rules-list li').first().find('.rule-filter-container select').val(),
                 'complex_list_column');
    assert.equal(find('.filter-container .builder .rules-list li').first().find('.rule-operator-container select').val(), 'is_not_null');
    assert.notOk(find('.filter-container .builder .rules-list li').first().find('.rule-value-container input').val());
    assert.equal(find('.filter-container .builder .rules-list li').last().find('.rule-filter-container select').val(), 'simple_column');
    assert.equal(find('.filter-container .builder .rules-list li').last().find('.rule-operator-container select').val(), 'in');
    assert.equal(find('.filter-container .builder .rules-list li').last().find('.rule-value-container input').val(), 'foo,bar');
  });
});

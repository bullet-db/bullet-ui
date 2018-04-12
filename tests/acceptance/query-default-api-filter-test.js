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
import { jsonWrap, mockAPI } from '../helpers/pretender';

let server;
let url = 'http://foo.bar.com/api/filter';
let hit = 0;

moduleForAcceptance('Acceptance | query default api filter', {
  suppressLogging: true,

  beforeEach() {
    // Inject into defaultValues in routes, our mock filter values
    this.application.register('settings:mocked', Ember.Object.create({ defaultFilter: url }), { instantiate: false });
    this.application.inject('route', 'settings', 'settings:mocked');

    // Extend regular API with a filter endpoint
    server = mockAPI(COLUMNS.BASIC);
    this.mockStompCLient.mockAPI(RESULTS.MULTIPLE);
    hit = 0;
    server.map(function() {
      this.get(url, () => {
        hit++;
        return jsonWrap(200, FILTERS.AND_ENUMERATED);
      });
    });
  },

  afterEach() {
    server.shutdown();
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
                 'enumerated_map_column.nested_1');
    assert.equal(find('.filter-container .builder .rules-list li').first().find('.rule-operator-container select').val(), 'not_in');
    assert.equal(find('.filter-container .builder .rules-list li').first().find('.rule-value-container input').val(), '1,2,3');
    assert.equal(find('.filter-container .builder .rules-list li').last().find('.rule-filter-container select').val(), 'simple_column');
    assert.equal(find('.filter-container .builder .rules-list li').last().find('.rule-operator-container select').val(), 'in');
    assert.equal(find('.filter-container .builder .rules-list li').last().find('.rule-value-container input').val(), 'foo,bar');
  });
});

test('it reuses fetched values when creating new queries', function(assert) {
  assert.expect(1);
  visit('/queries/new');
  visit('/queries/new');
  visit('/queries/new');
  andThen(function() {
    assert.equal(hit, 1);
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';

moduleForAcceptance('Acceptance | navigation', {
  suppressLogging: true,

  beforeEach() {
    this.mockedAPI.mock(RESULTS.MULTIPLE, COLUMNS.BASIC);
  },

  afterEach() {
    // Wipe out localstorage because we are creating here
    window.localStorage.clear();
  }
});

test('visiting / and redirecting to queries', function(assert) {
  visit('/');

  andThen(() => {
    assert.equal(currentURL(), '/queries');
  });
});

test('visiting a non-existant query', function(assert) {
  visit('/query/foo');
  andThen(() => {
    assert.equal(currentURL(), '/errored');
  });
});

test('visiting a page and click past queries and results', function(assert) {
  visit('/schema');
  andThen(() => {
    click('.left-bar .left-bar-link:contains(\'Queries\')');
  });
  andThen(() => {
    assert.equal(currentURL(), '/queries');
  });
});

test('visiting / and going to the schema page', function(assert) {
  visit('/');
  click('.left-bar .left-bar-link:contains(\'Schema\')');
  andThen(() => {
    assert.equal(currentRouteName(), 'schema');
  });
});

test('visiting / and going somewhere and coming back to the index page', function(assert) {
  visit('/schema');
  click('.left-bar .left-bar-link:contains(\'Queries\')');
  click('.queries-list .add-button');
  click('.navbar-logo > a');
  andThen(() => {
    assert.equal(currentURL(), '/queries');
  });
});

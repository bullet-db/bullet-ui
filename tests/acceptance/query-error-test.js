/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';

moduleForAcceptance('Acceptance | query error', {
  suppressLogging: true,

  beforeEach() {
    this.mockedAPI.mock([RESULTS.MULTIPLE], COLUMNS.BASIC);
  }
});

test('visiting a non-existant query', function(assert) {
  visit('/query/foo');

  andThen(function() {
    assert.equal(currentURL(), '/errored');
  });
});

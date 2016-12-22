/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { mockAPI } from '../helpers/pretender';

let server;

moduleForAcceptance('Acceptance | query error', {
  beforeEach() {
    server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);
  },

  afterEach() {
    server.shutdown();
  }
});

test('visiting a non-existant query', function(assert) {
  visit('/query/foo');

  andThen(function() {
    assert.equal(currentURL(), '/not-found');
  });
});

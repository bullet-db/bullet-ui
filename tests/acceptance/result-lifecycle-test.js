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

moduleForAcceptance('Acceptance | result lifecycle', {
  beforeEach() {
    return window.localforage.setDriver(window.localforage.LOCALSTORAGE);
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
    return window.localforage.clear();
  }
});

test('it has a link to go back to the query from the result', function(assert) {
  assert.expect(2);

  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);
  let createdQuery;
  visit('/queries/new').then(() => {
    createdQuery = currentURL();
  });
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
  });
  click('.query-blurb-wrapper');
  andThen(() => {
    assert.equal(currentURL(), createdQuery);
  });
});

test('it lets you swap between raw and tabular forms', function(assert) {
  assert.expect(4);

  server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);

  visit('/queries/new');
  click('.submit-button');
  click('.table-view');
  andThen(() => {
    assert.equal(find('.pretty-json-container').length, 0);
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 9);
  });
  click('.raw-view');
  andThen(() => {
    assert.equal(find('.lt-body .lt-row .lt-cell').length, 0);
    assert.equal(find('.pretty-json-container').length, 1);
  });
});

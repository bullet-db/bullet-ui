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
    // Wipe out localstorage because we are creating queries here
    window.localStorage.clear();
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
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

test('it lets you expand metadata can be expanded in results in raw format', function(assert) {
  assert.expect(7);
  server = mockAPI(RESULTS.COUNT_DISTINCT, COLUMNS.BASIC);

  visit('/queries/new');
  click('.output-container .count-distinct-option #count-distinct');
  click('.output-container .count-distinct-option .fields-selection-container .add-field');
  selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('.records-table').length, 1);
    assert.equal(find('.result-metadata').length, 1);
    assert.notOk(find('.result-metadata').hasClass('is-expanded'));
    assert.equal(find('.result-metadata pre').length, 0);
    click('.result-metadata .expand-bar');
    andThen(() => {
      assert.ok(find('.result-metadata').hasClass('is-expanded'));
      assert.equal(find('.result-metadata pre').length, 1);
    });
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';

let server;

moduleForAcceptance('Acceptance | schema', {
  suppressLogging: true,

  beforeEach() {
    server = this.mockAPI.mock(RESULTS.SINGLE, COLUMNS.BASIC);
  },

  afterEach() {
    if (server) {
      server.shutdown();
    }
  }
});

test('enumerated columns can be expanded and collapsed properly', function(assert) {
  assert.expect(20);

  visit('/schema');

  andThen(function() {
    assert.equal(find('.schema-table .lt-body .lt-row').length, 4);
    assert.equal(find('.schema-table .lt-body .lt-row:eq(0) .schema-name-entry').text().trim(), 'complex_list_column');
    assert.equal(find('.schema-table .lt-body .lt-row:eq(1) .schema-name-entry').text().trim(), 'complex_map_column');
    assert.equal(find('.schema-table .lt-body .lt-row:eq(2) .schema-name-entry').text().trim(), 'enumerated_map_column');
    assert.equal(find('.schema-table .lt-body .lt-row:eq(3) .schema-name-entry').text().trim(), 'simple_column');
    assert.equal(find('.schema-table .lt-body .lt-row:eq(0) .schema-type-entry').text().trim(), 'LIST OF MAPS');
    assert.equal(find('.schema-table .lt-body .lt-row:eq(1) .schema-type-entry').text().trim(), 'MAP OF STRINGS TO STRINGS');
    assert.equal(find('.schema-table .lt-body .lt-row:eq(2) .schema-type-entry').text().trim(), 'MAP OF STRINGS TO STRINGS');
    assert.equal(find('.schema-table .lt-body .lt-row:eq(3) .schema-type-entry').text().trim(), 'STRING');

    assert.ok(find('.schema-table .lt-body .lt-row:eq(2)').hasClass('has-enumerations'));
    assert.ok(find('.schema-table .lt-body .lt-row:eq(2) .schema-name-entry .schema-enumeration-caret i').hasClass('expand-caret'));
  });

  click('.schema-table .lt-body .lt-row:eq(2)');
  andThen(function() {
    assert.ok(find('.schema-table .lt-body .lt-row:eq(2) .schema-name-entry .schema-enumeration-caret i').hasClass('expanded-caret'));

    assert.equal(find('.schema-table .lt-body .lt-expanded-row').length, 1);
    assert.equal(find('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row').length, 2);
    assert.equal(find('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row:eq(0) .schema-name-entry').text().trim(), 'nested_1');
    assert.equal(find('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row:eq(1) .schema-name-entry').text().trim(), 'nested_2');
    assert.equal(find('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row:eq(0) .schema-type-entry').text().trim(), 'STRING');
    assert.equal(find('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row:eq(1) .schema-type-entry').text().trim(), 'STRING');
  });

  click('.schema-table .lt-body .lt-row:eq(2)');
  andThen(function() {
    assert.ok(find('.schema-table .lt-body .lt-row:eq(2) .schema-name-entry .schema-enumeration-caret i').hasClass('expand-caret'));
    assert.equal(find('.schema-table .lt-body .lt-expanded-row').length, 0);
  });
});

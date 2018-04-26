/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import setupForAcceptanceTest from '../helpers/setup-for-acceptance-test';
import { click, visit } from '@ember/test-helpers';
import $ from 'jquery';

module('Acceptance | schema', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('enumerated columns can be expanded and collapsed properly', async function(assert) {
    assert.expect(20);

    await visit('/schema');

    assert.equal($('.schema-table .lt-body .lt-row').length, 4);
    assert.equal($('.schema-table .lt-body .lt-row:eq(0) .schema-name-entry').text().trim(), 'complex_list_column');
    assert.equal($('.schema-table .lt-body .lt-row:eq(1) .schema-name-entry').text().trim(), 'complex_map_column');
    assert.equal($('.schema-table .lt-body .lt-row:eq(2) .schema-name-entry').text().trim(), 'enumerated_map_column');
    assert.equal($('.schema-table .lt-body .lt-row:eq(3) .schema-name-entry').text().trim(), 'simple_column');
    assert.equal($('.schema-table .lt-body .lt-row:eq(0) .schema-type-entry').text().trim(), 'LIST OF MAPS');
    assert.equal($('.schema-table .lt-body .lt-row:eq(1) .schema-type-entry').text().trim(), 'MAP OF STRINGS TO STRINGS');
    assert.equal($('.schema-table .lt-body .lt-row:eq(2) .schema-type-entry').text().trim(), 'MAP OF STRINGS TO STRINGS');
    assert.equal($('.schema-table .lt-body .lt-row:eq(3) .schema-type-entry').text().trim(), 'STRING');

    assert.ok($('.schema-table .lt-body .lt-row:eq(2)').hasClass('has-enumerations'));
    assert.ok($('.schema-table .lt-body .lt-row:eq(2) .schema-name-entry .schema-enumeration-caret i').hasClass('expand-caret'));

    await click($('.schema-table .lt-body .lt-row:eq(2)')[0]);
    assert.ok($('.schema-table .lt-body .lt-row:eq(2) .schema-name-entry .schema-enumeration-caret i').hasClass('expanded-caret'));

    assert.equal($('.schema-table .lt-body .lt-expanded-row').length, 1);
    assert.equal($('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row').length, 2);
    assert.equal($('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row:eq(0) .schema-name-entry').text().trim(), 'nested_1');
    assert.equal($('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row:eq(1) .schema-name-entry').text().trim(), 'nested_2');
    assert.equal($('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row:eq(0) .schema-type-entry').text().trim(), 'STRING');
    assert.equal($('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row:eq(1) .schema-type-entry').text().trim(), 'STRING');

    await click($('.schema-table .lt-body .lt-row:eq(2)')[0]);
    assert.ok($('.schema-table .lt-body .lt-row:eq(2) .schema-name-entry .schema-enumeration-caret i').hasClass('expand-caret'));
    assert.equal($('.schema-table .lt-body .lt-expanded-row').length, 0);
  });
});

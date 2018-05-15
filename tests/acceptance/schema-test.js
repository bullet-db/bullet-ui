/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { setupForAcceptanceTest } from '../helpers/setup-for-acceptance-test';
import { click, visit, findAll } from '@ember/test-helpers';
import { findIn } from '../helpers/find-helpers';

module('Acceptance | schema', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('enumerated columns can be expanded and collapsed properly', async function(assert) {
    assert.expect(20);

    await visit('/schema');

    assert.equal(findAll('.schema-table .lt-body .lt-row').length, 4);
    assert.equal(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-row')[0]).textContent.trim(), 'complex_list_column');
    assert.equal(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-row')[1]).textContent.trim(), 'complex_map_column');
    assert.equal(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-row')[2]).textContent.trim(), 'enumerated_map_column');
    assert.equal(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-row')[3]).textContent.trim(), 'simple_column');
    assert.equal(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-row')[0]).textContent.trim(), 'LIST OF MAPS');
    assert.equal(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-row')[1]).textContent.trim(), 'MAP OF STRINGS TO STRINGS');
    assert.equal(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-row')[2]).textContent.trim(), 'MAP OF STRINGS TO STRINGS');
    assert.equal(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-row')[3]).textContent.trim(), 'STRING');

    assert.ok(findAll('.schema-table .lt-body .lt-row')[2].classList.contains('has-enumerations'));
    assert.ok(findIn('.schema-name-entry .schema-enumeration-caret i', findAll('.schema-table .lt-body .lt-row')[2]).classList.contains('expand-caret'));

    await click(findAll('.schema-table .lt-body .lt-row')[2]);
    assert.ok(findIn('.schema-name-entry .schema-enumeration-caret i', findAll('.schema-table .lt-body .lt-row')[2]).classList.contains('expanded-caret'));

    assert.equal(findAll('.schema-table .lt-body .lt-expanded-row').length, 1);
    assert.equal(findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row').length, 2);
    assert.equal(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row')[0]).textContent.trim(), 'nested_1');
    assert.equal(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row')[1]).textContent.trim(), 'nested_2');
    assert.equal(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row')[0]).textContent.trim(), 'STRING');
    assert.equal(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row')[1]).textContent.trim(), 'STRING');

    await click(findAll('.schema-table .lt-body .lt-row')[2]);
    assert.ok(findIn('.schema-name-entry .schema-enumeration-caret i', findAll('.schema-table .lt-body .lt-row')[2]).classList.contains('expand-caret'));
    assert.equal(findAll('.schema-table .lt-body .lt-expanded-row').length, 0);
  });
});

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

    assert.dom('.schema-table .lt-body .lt-row').exists({ count: 4 });
    assert.dom(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-row')[0])).hasText('complex_list_column');
    assert.dom(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-row')[1])).hasText('complex_map_column');
    assert.dom(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-row')[2])).hasText('enumerated_map_column');
    assert.dom(findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-row')[3])).hasText('simple_column');
    assert.dom(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-row')[0])).hasText('LIST OF MAPS');
    assert.dom(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-row')[1])).hasText('MAP OF STRINGS TO STRINGS');
    assert.dom(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-row')[2])).hasText('MAP OF STRINGS TO STRINGS');
    assert.dom(findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-row')[3])).hasText('STRING');

    assert.dom(findAll('.schema-table .lt-body .lt-row')[2]).hasClass('has-enumerations');
    assert.dom(
      findIn('.schema-name-entry .schema-enumeration-caret i', findAll('.schema-table .lt-body .lt-row')[2])
    ).hasClass('expand-caret');

    await click(findAll('.schema-table .lt-body .lt-row')[2]);
    assert.dom(
      findIn('.schema-name-entry .schema-enumeration-caret i', findAll('.schema-table .lt-body .lt-row')[2])
    ).hasClass('expanded-caret');

    assert.dom('.schema-table .lt-body .lt-expanded-row').exists({ count: 1 });
    assert.dom('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row').exists({ count: 2 });
    assert.dom(
      findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row')[0])
    ).hasText('nested_1');
    assert.dom(
      findIn('.schema-name-entry', findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row')[1])
    ).hasText('nested_2');
    assert.dom(
      findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row')[0])
    ).hasText('STRING');
    assert.dom(
      findIn('.schema-type-entry', findAll('.schema-table .lt-body .lt-expanded-row .schema-table.is-nested .lt-row')[1])
    ).hasText('STRING');

    await click(findAll('.schema-table .lt-body .lt-row')[2]);
    assert.dom(
      findIn('.schema-name-entry .schema-enumeration-caret i', findAll('.schema-table .lt-body .lt-row')[2])
    ).hasClass('expand-caret');
    assert.dom('.schema-table .lt-body .lt-expanded-row').doesNotExist();
  });
});

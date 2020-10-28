/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import { setupForAcceptanceTest } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { visit, click, fillIn, triggerEvent, currentURL, findAll } from '@ember/test-helpers';
import { findIn } from 'bullet-ui/tests/helpers/find-helpers';


module('Acceptance | bql lifecycle', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('creating a bql query and finding it again', async function(assert) {
    assert.expect(1);

    await visit('/queries/bql');
    let createdQuery = currentURL();
    await visit('queries');
    await click('.queries-table .query-name-entry .query-description');
    assert.equal(currentURL(), createdQuery);
  });

  test('creating a bql query and copying it', async function(assert) {
    assert.expect(2);

    await visit('/queries/bql');
    await visit('queries');
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .copy-icon');
    assert.dom('.query-description').exists({ count: 2 });
  });

  test('creating multiple bql queries and deleting them', async function(assert) {
    assert.expect(3);

    await visit('/queries/bql');
    await visit('/queries/bql');
    await visit('queries');
    assert.dom('.query-description').exists({ count: 2 });
    await triggerEvent(findAll('.queries-table .query-name-entry')[0], 'mouseover');
    await click(findIn('.query-name-actions .delete-icon', findAll('.queries-table .query-name-entry')[0]));
    assert.dom('.query-description').exists({ count: 1 });
    await triggerEvent('.queries-table .query-name-entry', 'mouseover');
    await click('.queries-table .query-name-entry .query-name-actions .delete-icon');
    assert.dom('.query-description').doesNotExist();
  });

  test('saving a custom bql query with a name and finding it again', async function(assert) {
    assert.expect(1);

    await visit('/queries/bql');

    await fillIn('.name-container input', 'test query');
    await click('.save-button');
    await visit('queries');
    await click('.queries-table .query-name-entry .query-description');

    assert.dom('.name-container input').hasValue('test query');
  });
});

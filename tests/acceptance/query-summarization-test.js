/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import { setupForAcceptanceTest } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import { visit, click, fillIn, triggerEvent, findAll, blur } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { findIn } from 'bullet-ui/tests/helpers/find-helpers';

module('Acceptance | query summarization', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.SINGLE], COLUMNS.BASIC);

  test('it summarizes a blank query', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.save-button');
    await visit('queries');

    assert.dom('.query-description .summary-text').hasText('SELECT * FROM STREAM(20000, TIME) LIMIT 1');
  });

  test('it summarizes a query with filters', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.filter-container button[data-add=\'rule\']');
    await click('.filter-container button[data-add=\'group\']');
    await click('.filter-container .rules-group-container .rules-group-container button[data-add=\'rule\']');
    // Both the top level and nested filter should be filled out now
    findAll('.filter-container .rule-filter-container select').forEach(async function(e) {
      e.value = 'complex_map_column';
      await triggerEvent(e, 'change');
    });
    // The first operation is is_null so it should be autopicked and it should save
    await click('.save-button');
    await visit('queries');

    assert.dom('.query-description .summary-text').hasText(
      'SELECT * FROM STREAM(20000, TIME) WHERE complex_map_column IS NULL AND ' +
      '( complex_map_column IS NULL AND complex_map_column IS NULL ) LIMIT 1'
    );
  });

  test('it summarizes a query with raw fields', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.SINGLE], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-container .raw-sub-options #select');

    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[0]), 'complex_map_column.*');
    await fillIn(
      findIn('.field-selection .column-sub-field input', findAll('.projections-container .field-selection-container')[0]),
      'foo'
    );
    await blur(findIn('.field-selection .column-sub-field input', findAll('.projections-container .field-selection-container')[0]));
    await fillIn('.projections-container .field-selection-container .field-name input', 'new_name');

    await click('.output-container .projections-container .add-projection');
    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[1]), 'simple_column');
    await click('.output-container .projections-container .add-projection');
    await selectChoose(findIn('.field-selection', findAll('.projections-container .field-selection-container')[2]), 'complex_map_column.*');
    await fillIn(
      findIn('.field-selection .column-sub-field input', findAll('.projections-container .field-selection-container')[2]),
      'bar'
    );
    await blur(findIn('.field-selection .column-sub-field input', findAll('.projections-container .field-selection-container')[2]));

    await click('.save-button');
    await visit('queries');

    assert.dom('.query-description .summary-text').hasText(
      'SELECT complex_map_column.foo AS "new_name", simple_column AS "simple_column", ' +
      'complex_map_column.bar AS "complex_map_column.bar" FROM STREAM(20000, TIME) LIMIT 1'
    );
  });

  test('it summarizes a count distinct query', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.COUNT_DISTINCT], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #count-distinct');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[0]), 'simple_column');
    await click('.output-container .fields-selection-container .add-field');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[1]), 'complex_map_column');
    await fillIn('.output-container .count-distinct-display-name input', 'cnt');
    await click('.save-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT COUNT(DISTINCT simple_column, complex_map_column) AS "cnt" FROM STREAM(20000, TIME)'
    );
  });

  test('it summarizes a distinct query', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.GROUP], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #grouped-data');

    await click('.groups-container .add-group');
    await selectChoose(findIn('.field-selection', findAll('.groups-container .field-selection-container')[0]), 'complex_map_column.*');
    await fillIn(findIn('.field-selection .column-sub-field input', findAll('.groups-container .field-selection-container')[0]), 'foo');
    await blur(
      findIn('.field-selection .column-sub-field input', findAll('.groups-container .field-selection-container')[0])
    );

    await click('.groups-container .add-group');
    await selectChoose(findIn('.field-selection', findAll('.groups-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.groups-container .field-selection-container')[1]), 'bar');

    await click('.save-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT complex_map_column.foo AS "complex_map_column.foo", simple_column AS "bar" ' +
      'FROM STREAM(20000, TIME) GROUP BY complex_map_column.foo, simple_column LIMIT 512'
    );
  });

  test('it summarizes a group all query', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.GROUP], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #grouped-data');

    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metric-selection', findAll('.output-container .metrics-container .field-selection-container')[0]), 'Count');

    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metric-selection', findAll('.output-container .metrics-container .field-selection-container')[1]), 'Average');
    await selectChoose(findIn('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.output-container .metrics-container .field-selection-container')[1]), 'avg_s');

    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metric-selection', findAll('.output-container .metrics-container .field-selection-container')[2]), 'Average');
    await selectChoose(findIn('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[2]), 'simple_column');

    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metric-selection', findAll('.output-container .metrics-container .field-selection-container')[3]), 'Sum');
    await selectChoose(findIn('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[3]), 'simple_column');

    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metric-selection', findAll('.output-container .metrics-container .field-selection-container')[4]), 'Minimum');
    await selectChoose(findIn('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[4]), 'simple_column');

    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metric-selection', findAll('.output-container .metrics-container .field-selection-container')[5]), 'Maximum');
    await selectChoose(findIn('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[5]), 'simple_column');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT COUNT(*), AVG(simple_column) AS "avg_s", AVG(simple_column), SUM(simple_column), MIN(simple_column), ' +
      'MAX(simple_column)  FROM STREAM(20000, TIME) LIMIT 512');
  });

  test('it summarizes a grouped data query with groups first', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.GROUP], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #grouped-data');

    await click('.groups-container .add-group');
    await selectChoose(findIn('.field-selection', findAll('.groups-container .field-selection-container')[0]), 'complex_map_column.*');
    await fillIn(findIn('.field-selection .column-sub-field input', findAll('.groups-container .field-selection-container')[0]), 'foo');
    await blur(findIn('.field-selection .column-sub-field input', findAll('.groups-container .field-selection-container')[0]));

    await click('.groups-container .add-group');
    await selectChoose(findIn('.field-selection', findAll('.groups-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.groups-container .field-selection-container')[1]), 'bar');

    await click('.output-container .metrics-container .add-metric');
    await click('.output-container .metrics-container .add-metric');
    await selectChoose(findIn('.metric-selection', findAll('.output-container .metrics-container .field-selection-container')[0]), 'Count');
    await selectChoose(findAll('.output-container .metrics-container .metric-selection')[1], 'Average');
    await selectChoose(findIn('.field-selection', findAll('.output-container .metrics-container .field-selection-container')[1]), 'simple_column');
    await fillIn(findIn('.field-name input', findAll('.output-container .metrics-container .field-selection-container')[1]), 'avg_bar');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT complex_map_column.foo AS "complex_map_column.foo", simple_column AS "bar", COUNT(*), ' +
      'AVG(simple_column) AS "avg_bar" FROM STREAM(20000, TIME) GROUP BY complex_map_column.foo, simple_column ' +
      'LIMIT 512'
    );
  });

  test('it summarizes a quantile distribution query', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.DISTRIBUTION], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #distribution');

    await selectChoose('.output-container .field-selection-container .field-selection', 'complex_map_column.*');
    await fillIn('.output-container .field-selection-container .field-selection .column-sub-field input', 'foo');
    await blur('.output-container .field-selection-container .field-selection .column-sub-field input');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT QUANTILE(complex_map_column.foo, LINEAR, 11) FROM STREAM(20000, TIME) LIMIT 512'
    );
  });

  test('it summarizes a frequency distribution query', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.DISTRIBUTION], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #distribution');
    await click('.distribution-type-options #frequency');

    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT FREQ(simple_column, LINEAR, 11) FROM STREAM(20000, TIME) LIMIT 512'
    );
  });

  test('it summarizes a cumulative frequency distribution query', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.DISTRIBUTION], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #distribution');
    await click('.distribution-type-options #cumulative');

    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT CUMFREQ(simple_column, LINEAR, 11) FROM STREAM(20000, TIME) LIMIT 512'
    );
  });

  test('it summarizes a top k query', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.TOP_K], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #top-k');

    await selectChoose('.output-container .field-selection-container .field-selection', 'simple_column');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT TOP(1, simple_column), simple_column AS "simple_column" FROM STREAM(20000, TIME)'
    );
  });

  test('it summarizes a top k query with multiple fields', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.TOP_K], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #top-k');

    await click('.output-container .add-field');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[0]), 'simple_column');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[1]), 'complex_map_column.*');
    await fillIn(findIn('.field-selection .column-sub-field input', findAll('.output-container .field-selection-container')[1]), 'foo');
    await blur(findIn('.field-selection .column-sub-field input', findAll('.output-container .field-selection-container')[1]));

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT TOP(1, simple_column, complex_map_column.foo), simple_column AS "simple_column", ' +
      'complex_map_column.foo AS "complex_map_column.foo" FROM STREAM(20000, TIME)'
    );
  });

  test('it summarizes a top k query with custom k and threshold', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.TOP_K], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #top-k');

    await click('.output-container .add-field');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[0]), 'simple_column');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[1]), 'complex_map_column.*');
    await fillIn(findIn('.field-selection .column-sub-field input', findAll('.output-container .field-selection-container')[1]), 'foo');
    await blur(findIn('.field-selection .column-sub-field input', findAll('.output-container .field-selection-container')[1]));

    await fillIn('.output-container .top-k-size input', '15');
    await fillIn('.output-container .top-k-min-count input', '1500');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT TOP(15, 1500, simple_column, complex_map_column.foo), simple_column AS "simple_column", ' +
      'complex_map_column.foo AS "complex_map_column.foo" FROM STREAM(20000, TIME)'
    );
  });

  test('it summarizes a top k query with custom k, threshold and name', async function(assert) {
    assert.expect(1);
    this.mockedAPI.mock([RESULTS.TOP_K], COLUMNS.BASIC);

    await visit('/queries/build');
    await click('.output-options #top-k');

    await click('.output-container .add-field');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[0]), 'simple_column');
    await selectChoose(findIn('.field-selection', findAll('.output-container .field-selection-container')[1]), 'complex_map_column.*');
    await fillIn(findIn('.field-selection .column-sub-field input', findAll('.output-container .field-selection-container')[1]), 'foo');
    await blur(findIn('.field-selection .column-sub-field input', findAll('.output-container .field-selection-container')[1]));

    await fillIn('.output-container .top-k-size input', '15');
    await fillIn('.output-container .top-k-min-count input', '1500');
    await fillIn('.output-container .top-k-display-name input', 'cnt');

    await click('.submit-button');
    await visit('queries');
    assert.dom('.query-description .summary-text').hasText(
      'SELECT TOP(15, 1500, simple_column, complex_map_column.foo) AS "cnt", simple_column AS "simple_column", ' +
      'complex_map_column.foo AS "complex_map_column.foo" FROM STREAM(20000, TIME)'
    );
  });
});

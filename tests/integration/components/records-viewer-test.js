/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import RESULTS from 'bullet-ui/tests/fixtures/results';

let originalSave;

function assertDataEquals(assert, data, fileName) {
  return function(blob, name) {
    let reader = new window.FileReader();
    reader.onload = e => {
      let asText = e.target.result;
      assert.equal(asText, data);
      assert.equal(fileName, name);
    };
    reader.readAsText(blob);
  };
}

module('Integration | Component | records viewer', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    originalSave = window.saveAs;
  });

  hooks.afterEach(function() {
    window.saveAs = originalSave;
  });

  test('it renders the data by default in pretty json if it is raw', async function(assert) {
    assert.expect(3);
    this.set('mockConfig', { isReallyRaw: true });
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    assert.dom('.raw-display').exists({ count: 1 });
    assert.dom('.pretty-json-container').exists({ count: 1 });
    assert.dom('.pretty-json-container').includesText('Array[1]');
  });

  test('it renders the data as a table if it is now raw', async function(assert) {
    assert.expect(3);
    this.set('mockConfig', { });
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    assert.dom(this.element.querySelector('.table-view')).hasClass('active');
    assert.dom('.lt-column').exists({ count: 3 });
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 3 });
  });

  test('it allows swapping between table and the raw views', async function(assert) {
    assert.expect(14);
    this.set('mockConfig', { isSingleRow: true });
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    await click('.table-view');
    assert.dom('.chart-view').doesNotExist();
    assert.dom('.table-view').hasClass('active');
    assert.dom('.raw-display').doesNotExist();
    assert.dom('.records-table').exists({ count: 1 });
    assert.dom('.lt-column').exists({ count: 3 });
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 3 });
    await click('.raw-view');
    assert.dom('.chart-view').doesNotExist();
    assert.dom('.raw-view').hasClass('active');
    assert.dom('.records-table').doesNotExist();
    assert.dom('.raw-display').exists({ count: 1 });
    assert.dom('.pretty-json-container').exists({ count: 1 });
    await click('.table-view');
    assert.dom('.table-view').hasClass('active');
    assert.dom('.lt-column').exists({ count: 3 });
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 3 });
  });

  test('it allows downloading the data in 3 formats', async function(assert) {
    assert.expect(4);
    this.set('mockConfig', { });
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    assert.dom('.download-option').exists({ count: 3 });
    let options = this.element.querySelectorAll('.download-option > a');
    assert.dom(options[0]).hasText('JSON');
    assert.dom(options[1]).hasText('CSV');
    assert.dom(options[2]).hasText('Flat CSV');
  });

  test('it allows downloading the data as JSON', async function(assert) {
    assert.expect(2);
    window.saveAs = assertDataEquals(assert, JSON.stringify(RESULTS.SINGLE.records, null, 2), 'results.json');
    this.set('mockConfig', { });
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    await click(this.element.querySelectorAll('.download-option > a')[0]);
  });

  test('it allows downloading the data as CSV', async function(assert) {
    assert.expect(2);
    let expected = 'bar,baz,foo,norf,qux\r\n' +
                   '1231231233,baz,test,{"_t":"moo","_i":"goo","custom":"gai","field":"pan"},test';
    window.saveAs = assertDataEquals(assert, expected, 'results.csv');
    this.set('mockConfig', { });
    this.set('mockRecords', RESULTS.RAW.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    await click(this.element.querySelectorAll('.download-option > a')[1]);
  });

  test('it allows downloading the data as flat CSV', async function(assert) {
    assert.expect(2);
    let expected = 'bar,baz,foo,norf:_i,norf:_t,norf:custom,norf:field,qux\r\n' +
                   '1231231233,baz,test,goo,moo,gai,pan,test';
    window.saveAs = assertDataEquals(assert, expected, 'results_flat.csv');
    this.set('mockConfig', { });
    this.set('mockRecords', RESULTS.RAW.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    await click(this.element.querySelectorAll('.download-option > a')[2]);
  });

  test('it handles missing columns across rows when making CSVs', async function(assert) {
    assert.expect(2);
    let expected = 'domain,foo,ts\r\n' +
                   'foo,test1,1231231231\r\n' +
                   'bar,test2,\r\n' +
                   ',test3,';
    window.saveAs = assertDataEquals(assert, expected, 'results.csv');
    this.set('mockConfig', { });
    this.set('mockRecords', RESULTS.MULTIPLE_MISSING.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    await click(this.element.querySelectorAll('.download-option > a')[1]);
  });

  test('it enables charting mode if the results have more than one row', async function(assert) {
    assert.expect(9);
    this.set('mockConfig', { isSingleRow: false });
    this.set('mockRecords', RESULTS.GROUP.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    assert.dom('.chart-view').exists({ count: 1 });
    assert.dom('.raw-display').doesNotExist();
    assert.dom('.records-table').exists({ count: 1 });
    assert.dom('.lt-column').exists({ count: 4 });
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 12 });
    await click('.chart-view');
    assert.dom('.records-table').doesNotExist();
    assert.dom('.raw-display').doesNotExist();
    // Defaults to line chart view
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.visual-container canvas').exists({ count: 1 });
  });

  test('it allows you to switch to pivot mode', async function(assert) {
    assert.expect(12);
    this.set('mockConfig', EmberObject.create({ isSingleRow: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({
      save() {
        assert.ok(true);
      }
    }));
    this.set('mockRecords', RESULTS.DISTRIBUTION.records);
    await render(hbs`<RecordsViewer @model={{this.mockModel}} @records={{this.mockRecords}}
                                    @config={{this.mockConfig}}/>`);
    assert.dom('.chart-view').exists({ count: 1 });
    assert.dom('.raw-display').doesNotExist();
    assert.dom('.records-table').exists({ count: 1 });
    assert.dom('.lt-column').exists({ count: 3 });
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 9 });
    await click('.chart-view');
    assert.dom('.records-table').doesNotExist();
    assert.dom('.raw-display').doesNotExist();
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.visual-container canvas').exists({ count: 1 });
    await click('.records-charter .pivot-control');
    assert.dom('.records-charter .pivot-control').hasClass('active');
    assert.dom('.visual-container .pivot-table-container').exists({ count: 1 });
  });

  test('it enables only pivot mode if the results are raw', async function(assert) {
    assert.expect(10);
    this.set('mockConfig', EmberObject.create({ isRaw: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({
      save() {
        assert.ok(true);
      }
    }));
    this.set('mockRecords', RESULTS.GROUP.records);
    await render(hbs`<RecordsViewer @model={{this.mockModel}} @records={{this.mockRecords}}
                                    @config={{this.mockConfig}}/>`);
    assert.dom('.chart-view').exists({ count: 1 });
    assert.dom('.raw-display').doesNotExist();
    assert.dom('.records-table').exists({ count: 1 });
    assert.dom('.lt-column').exists({ count: 4 });
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 12 });
    await click('.chart-view');
    assert.dom('.records-table').doesNotExist();
    assert.dom('.raw-display').doesNotExist();
    assert.dom('.records-charter .pivot-control').hasClass('active');
    assert.dom('.visual-container .pivot-table-container').exists({ count: 1 });
  });

  test('it allows you to switch to raw json data mode', async function(assert) {
    assert.expect(8);
    this.set('mockConfig', { });
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}/>`);
    assert.dom('.chart-view').exists({ count: 1 });
    assert.dom('.raw-display').doesNotExist();
    await click('.raw-view');
    assert.dom('.raw-display').exists({ count: 1 });
    assert.dom('.pretty-json-container').exists({ count: 1 });
    assert.dom('.collapse-control .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.records-table').doesNotExist();
    await click('.mode-toggle .on-view');
    assert.dom('.raw-display .pretty-json-container').doesNotExist();
    assert.dom('pre').hasText(JSON.stringify(RESULTS.SINGLE.records, null, 4).trim());
  });

  test('it switches out of charting mode to table mode if charting is not allowed anymore', async function(assert) {
    assert.expect(7);
    this.set('mockTimeSeriesMode', true);
    this.set('mockConfig', { isSingleRow: true });
    this.set('mockRecords', RESULTS.GROUP.records);
    await render(hbs`<RecordsViewer @records={{this.mockRecords}} @config={{this.mockConfig}}
                                    @timeSeriesMode={{this.mockTimeSeriesMode}}/>`);
    assert.dom('.table-view').hasClass('active');
    assert.dom('.lt-column').exists({ count: 4 });
    await click('.chart-view');
    assert.dom('.chart-view').hasClass('active');
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.visual-container canvas').exists({ count: 1 });
    // Swaps to table automatically
    this.set('mockTimeSeriesMode', false);
    assert.dom('.table-view').hasClass('active');
    assert.dom('.lt-column').exists({ count: 4 });
  });
});

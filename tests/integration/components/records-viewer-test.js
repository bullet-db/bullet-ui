/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RESULTS from '../../fixtures/results';

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

  test('it renders the data by default in pretty json ', async function(assert) {
    this.set('mockRecords', RESULTS.SINGLE.records);
    this.set('rawMode', true);
    await render(hbs`{{records-viewer records=mockRecords showRawData=rawMode}}`);
    assert.equal(this.$('.raw-display').length, 1);
    assert.equal(this.$('.pretty-json-container').length, 1);
    assert.ok(this.$('.pretty-json-container').text().trim().startsWith('Array[1]'));
  });

  test('it allows swapping between table and the raw views', async function(assert) {
    assert.expect(11);
    this.set('mockModel', { isSingleRow: true });
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`{{records-viewer model=mockModel records=mockRecords}}`);
    await click('.table-view');
    assert.equal(this.$('.chart-view').length, 0);
    assert.ok(this.$('.table-view').hasClass('active'));
    assert.equal(this.$('.raw-display').length, 0);
    assert.equal(this.$('.records-table').length, 1);
    assert.equal(this.$('.lt-column').length, 3);
    assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 3);
    await click('.raw-view');
    assert.equal(this.$('.chart-view').length, 0);
    assert.ok(this.$('.raw-view').hasClass('active'));
    assert.equal(this.$('.records-table').length, 0);
    assert.equal(this.$('.raw-display').length, 1);
    assert.equal(this.$('.pretty-json-container').length, 1);
  });

  test('it allows downloading the data in 3 formats', async function(assert) {
    assert.expect(4);
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`{{records-viewer records=mockRecords}}`);
    assert.equal(this.$('.download-option').length, 3);
    assert.equal(this.$('.download-option > a:eq(0)').text(), 'JSON');
    assert.equal(this.$('.download-option > a:eq(1)').text(), 'CSV');
    assert.equal(this.$('.download-option > a:eq(2)').text(), 'Flat CSV');
  });

  test('it allows downloading the data as JSON', async function(assert) {
    assert.expect(2);
    window.saveAs = assertDataEquals(assert, JSON.stringify(RESULTS.SINGLE.records, null, 2), 'results.json');
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`{{records-viewer records=mockRecords}}`);
    await click(this.$('.download-option > a:eq(0)')[0]);
  });

  test('it allows downloading the data as CSV', async function(assert) {
    assert.expect(2);
    let expected = 'bar,baz,foo,norf,qux\r\n' +
                   '1231231233,baz,test,{"_t":"moo","_i":"goo","custom":"gai","field":"pan"},test';
    window.saveAs = assertDataEquals(assert, expected, 'results.csv');
    this.set('mockRecords', RESULTS.RAW.records);
    await render(hbs`{{records-viewer records=mockRecords}}`);
    await click(this.$('.download-option > a:eq(1)')[0]);
  });

  test('it allows downloading the data as flat CSV', async function(assert) {
    assert.expect(2);
    let expected = 'bar,baz,foo,norf:_i,norf:_t,norf:custom,norf:field,qux\r\n' +
                   '1231231233,baz,test,goo,moo,gai,pan,test';
    window.saveAs = assertDataEquals(assert, expected, 'results_flat.csv');
    this.set('mockRecords', RESULTS.RAW.records);
    await render(hbs`{{records-viewer records=mockRecords}}`);
    await click(this.$('.download-option > a:eq(2)')[0]);
  });

  test('it handles missing columns across rows when making CSVs', async function(assert) {
    assert.expect(2);
    let expected = 'domain,foo,ts\r\n' +
                   'foo,test1,1231231231\r\n' +
                   'bar,test2,\r\n' +
                   ',test3,';
    window.saveAs = assertDataEquals(assert, expected, 'results.csv');
    this.set('mockRecords', RESULTS.MULTIPLE_MISSING.records);
    await render(hbs`{{records-viewer records=mockRecords}}`);
    await click(this.$('.download-option > a:eq(1)')[0]);
  });

  test('it enables charting mode if the results have more than one row', async function(assert) {
    assert.expect(9);
    this.set('tableMode', true);
    this.set('mockModel', { isSingleRow: false });
    this.set('mockRecords', RESULTS.GROUP.records);
    await render(hbs`{{records-viewer model=mockModel records=mockRecords showTable=tableMode}}`);
    assert.equal(this.$('.chart-view').length, 1);
    assert.equal(this.$('.raw-display').length, 0);
    assert.equal(this.$('.records-table').length, 1);
    assert.equal(this.$('.lt-column').length, 4);
    assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 12);
    await click('.chart-view');
    assert.equal(this.$('.records-table').length, 0);
    assert.equal(this.$('.raw-display').length, 0);
    // Defaults to simple chart view
    assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
    assert.equal(this.$('.visual-container canvas').length, 1);
  });

  test('it allows you to switch to pivot mode', async function(assert) {
    assert.expect(12);
    this.set('tableMode', true);
    this.set('mockModel', EmberObject.create({
      isSingleRow: false,
      pivotOptions: null,
      save() {
        assert.ok(true);
      }
    }));
    this.set('mockRecords', RESULTS.DISTRIBUTION.records);
    await render(hbs`{{records-viewer model=mockModel records=mockRecords showTable=tableMode}}`);
    assert.equal(this.$('.chart-view').length, 1);
    assert.equal(this.$('.raw-display').length, 0);
    assert.equal(this.$('.records-table').length, 1);
    assert.equal(this.$('.lt-column').length, 3);
    assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 9);
    await click('.chart-view');
    assert.equal(this.$('.records-table').length, 0);
    assert.equal(this.$('.raw-display').length, 0);
    assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
    assert.equal(this.$('.visual-container canvas').length, 1);
    await click('.mode-toggle .right-view');
    assert.ok(this.$('.mode-toggle .right-view').hasClass('selected'));
    assert.equal(this.$('.visual-container .pivot-table-container').length, 1);
  });

  test('it enables only pivot mode if the results are raw', async function(assert) {
    assert.expect(10);
    this.set('tableMode', true);
    this.set('mockModel', EmberObject.create({
      isRaw: true,
      pivotOptions: null,
      save() {
        assert.ok(true);
      }
    }));
    this.set('mockRecords', RESULTS.GROUP.records);
    await render(hbs`{{records-viewer model=mockModel records=mockRecords showTable=tableMode}}`);
    assert.equal(this.$('.chart-view').length, 1);
    assert.equal(this.$('.raw-display').length, 0);
    assert.equal(this.$('.records-table').length, 1);
    assert.equal(this.$('.lt-column').length, 4);
    assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 12);
    await click('.chart-view');
    assert.equal(this.$('.records-table').length, 0);
    assert.equal(this.$('.raw-display').length, 0);
    assert.equal(this.$('.mode-toggle').length, 0);
    assert.equal(this.$('.visual-container .pivot-table-container').length, 1);
  });

  test('it allows you to switch to raw json data mode', async function(assert) {
    assert.expect(7);
    this.set('rawMode', true);
    this.set('mockRecords', RESULTS.SINGLE.records);
    await render(hbs`{{records-viewer records=mockRecords showRawData=rawMode}}`);
    assert.equal(this.$('.chart-view').length, 1);
    assert.equal(this.$('.raw-display').length, 1);
    assert.equal(this.$('.pretty-json-container').length, 1);
    assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
    assert.equal(this.$('.records-table').length, 0);
    await click('.mode-toggle .right-view');
    assert.equal(this.$('pre').text().trim(), JSON.stringify(RESULTS.SINGLE.records, null, 4).trim());
    assert.ok(this.$('.mode-toggle .right-view').hasClass('selected'));
  });
});

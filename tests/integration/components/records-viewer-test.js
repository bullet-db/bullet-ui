/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import RESULTS from '../../fixtures/results';

let originalSave;

function assertDataEquals(assert, data, fileName) {
  return function(blob, name) {
    let reader = new window.FileReader();
    reader.onload = (e) => {
      let asText = e.target.result;
      assert.equal(asText, data);
      assert.equal(fileName, name);
    };
    reader.readAsText(blob);
  };
}

moduleForComponent('records-viewer', 'Integration | Component | records viewer', {
  integration: true,

  beforeEach() {
    originalSave = window.saveAs;
  },

  afterEach() {
    window.saveAs = originalSave;
  }
});

test('it renders the data by default in pretty json ', function(assert) {
  this.set('mockRecords', RESULTS.SINGLE.records);
  this.set('rawMode', true);
  this.render(hbs`{{records-viewer records=mockRecords showRawData=rawMode}}`);
  assert.equal(this.$('.raw-display').length, 1);
  assert.equal(this.$('.pretty-json-container').length, 1);
  assert.ok(this.$('.pretty-json-container').text().trim().startsWith('Array[1]'));
});

test('it allows swapping between table and the raw views', function(assert) {
  assert.expect(11);
  this.set('mockModel', { isSingleRow: true });
  this.set('mockRecords', RESULTS.SINGLE.records);
  this.render(hbs`{{records-viewer model=mockModel records=mockRecords}}`);
  this.$('.table-view').click();
  return wait().then(() => {
    assert.equal(this.$('.chart-view').length, 0);
    assert.ok(this.$('.table-view').hasClass('active'));
    assert.equal(this.$('.raw-display').length, 0);
    assert.equal(this.$('.records-table').length, 1);
    assert.equal(this.$('.lt-column').length, 3);
    assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 3);
    this.$('.raw-view').click();
    return wait().then(() => {
      assert.equal(this.$('.chart-view').length, 0);
      assert.ok(this.$('.raw-view').hasClass('active'));
      assert.equal(this.$('.records-table').length, 0);
      assert.equal(this.$('.raw-display').length, 1);
      assert.equal(this.$('.pretty-json-container').length, 1);
    });
  });
});

test('it allows downloading the data in 3 formats', function(assert) {
  assert.expect(4);
  this.set('mockRecords', RESULTS.SINGLE.records);
  this.render(hbs`{{records-viewer records=mockRecords}}`);
  assert.equal(this.$('.download-option').length, 3);
  assert.equal(this.$('.download-option > a:eq(0)').text(), 'JSON');
  assert.equal(this.$('.download-option > a:eq(1)').text(), 'CSV');
  assert.equal(this.$('.download-option > a:eq(2)').text(), 'Flat CSV');
});

test('it allows downloading the data as JSON', function(assert) {
  assert.expect(2);
  window.saveAs = assertDataEquals(assert, JSON.stringify(RESULTS.SINGLE.records, null, 2), 'results.json');
  this.set('mockRecords', RESULTS.SINGLE.records);
  this.render(hbs`{{records-viewer records=mockRecords}}`);
  this.$('.download-option > a:eq(0)').click();
});

test('it allows downloading the data as CSV', function(assert) {
  assert.expect(2);
  let expected = 'bar,baz,foo,norf,qux\r\n' +
                 '1231231233,baz,test,{"_t":"moo","_i":"goo","custom":"gai","field":"pan"},test';
  window.saveAs = assertDataEquals(assert, expected, 'results.csv');
  this.set('mockRecords', RESULTS.RAW.records);
  this.render(hbs`{{records-viewer records=mockRecords}}`);
  this.$('.download-option > a:eq(1)').click();
});

test('it allows downloading the data as flat CSV', function(assert) {
  assert.expect(2);
  let expected = 'bar,baz,foo,norf:_i,norf:_t,norf:custom,norf:field,qux\r\n' +
                 '1231231233,baz,test,goo,moo,gai,pan,test';
  window.saveAs = assertDataEquals(assert, expected, 'results_flat.csv');
  this.set('mockRecords', RESULTS.RAW.records);
  this.render(hbs`{{records-viewer records=mockRecords}}`);
  this.$('.download-option > a:eq(2)').click();
});

test('it handles missing columns across rows when making CSVs', function(assert) {
  assert.expect(2);
  let expected = 'domain,foo,ts\r\n' +
                 'foo,test1,1231231231\r\n' +
                 'bar,test2,\r\n' +
                 ',test3,';
  window.saveAs = assertDataEquals(assert, expected, 'results.csv');
  this.set('mockRecords', RESULTS.MULTIPLE_MISSING.records);
  this.render(hbs`{{records-viewer records=mockRecords}}`);
  this.$('.download-option > a:eq(1)').click();
});

test('it enables charting mode if the results have more than one row', function(assert) {
  assert.expect(9);
  this.set('tableMode', true);
  this.set('mockModel', { isSingleRow: false });
  this.set('mockRecords', RESULTS.GROUP.records);
  this.render(hbs`{{records-viewer model=mockModel records=mockRecords showTable=tableMode}}`);
  assert.equal(this.$('.chart-view').length, 1);
  assert.equal(this.$('.raw-display').length, 0);
  assert.equal(this.$('.records-table').length, 1);
  assert.equal(this.$('.lt-column').length, 4);
  assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 12);
  this.$('.chart-view').click();
  return wait().then(() => {
    assert.equal(this.$('.records-table').length, 0);
    assert.equal(this.$('.raw-display').length, 0);
    // Defaults to simple chart view
    assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
    assert.equal(this.$('.visual-container canvas').length, 1);
  });
});

test('it allows you to switch to pivot mode', function(assert) {
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
  this.render(hbs`{{records-viewer model=mockModel records=mockRecords showTable=tableMode}}`);
  assert.equal(this.$('.chart-view').length, 1);
  assert.equal(this.$('.raw-display').length, 0);
  assert.equal(this.$('.records-table').length, 1);
  assert.equal(this.$('.lt-column').length, 3);
  assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 9);
  this.$('.chart-view').click();
  return wait().then(() => {
    assert.equal(this.$('.records-table').length, 0);
    assert.equal(this.$('.raw-display').length, 0);
    assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
    assert.equal(this.$('.visual-container canvas').length, 1);
    this.$('.mode-toggle .right-view').click();
    return wait().then(() => {
      assert.ok(this.$('.mode-toggle .right-view').hasClass('selected'));
      assert.equal(this.$('.visual-container .pivot-table-container').length, 1);
    });
  });
});

test('it enables only pivot mode if the results are raw', function(assert) {
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
  this.render(hbs`{{records-viewer model=mockModel records=mockRecords showTable=tableMode}}`);
  assert.equal(this.$('.chart-view').length, 1);
  assert.equal(this.$('.raw-display').length, 0);
  assert.equal(this.$('.records-table').length, 1);
  assert.equal(this.$('.lt-column').length, 4);
  assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 12);
  this.$('.chart-view').click();
  return wait().then(() => {
    assert.equal(this.$('.records-table').length, 0);
    assert.equal(this.$('.raw-display').length, 0);
    assert.equal(this.$('.mode-toggle').length, 0);
    assert.equal(this.$('.visual-container .pivot-table-container').length, 1);
  });
});

test('it allows you to switch to raw json data mode', function(assert) {
  assert.expect(7);
  this.set('rawMode', true);
  this.set('mockRecords', RESULTS.SINGLE.records);
  this.render(hbs`{{records-viewer records=mockRecords showRawData=rawMode}}`);
  assert.equal(this.$('.chart-view').length, 1);
  assert.equal(this.$('.raw-display').length, 1);
  assert.equal(this.$('.pretty-json-container').length, 1);
  assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
  assert.equal(this.$('.records-table').length, 0);
  this.$('.mode-toggle .right-view').click();
  return wait().then(() => {
    assert.equal(this.$('pre').text().trim(), JSON.stringify(RESULTS.SINGLE.records, null, 4).trim());
    assert.ok(this.$('.mode-toggle .right-view').hasClass('selected'));
  });
});

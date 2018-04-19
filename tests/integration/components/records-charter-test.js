/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import RESULTS from '../../fixtures/results';

moduleForComponent('records-charter', 'Integration | Component | records charter', {
  integration: true
});

test('it starts off in chart mode and allows you to switch to pivot mode', function(assert) {
  assert.expect(5);
  this.set('mockModel', EmberObject.create({ isRaw: false, isDistribution: true, pivotOptions: null, save() { } }));
  this.set('mockRows', RESULTS.DISTRIBUTION.records);
  this.set('mockColumns', ['Probability', 'Count', 'Range']);
  this.render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel}}`);

  assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
  assert.equal(this.$('.visual-container canvas').length, 1);
  this.$('.mode-toggle .right-view').click();
  return wait().then(() => {
    assert.ok(this.$('.mode-toggle .right-view').hasClass('selected'));
    assert.equal(this.$('.visual-container .pivot-table-container').length, 1);
    assert.equal(this.$('.visual-container .pivot-table-container .pvtUi').length, 1);
  });
});

test('it charts a single dependent column', function(assert) {
  assert.expect(2);
  this.set('mockModel', EmberObject.create({ isRaw: false, pivotOptions: null, save() { } }));
  this.set('mockRows', RESULTS.SINGLE.records);
  this.set('mockColumns', ['foo', 'timestamp', 'domain']);
  this.render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel}}`);
  assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
  assert.equal(this.$('.visual-container canvas').length, 1);
});

test('it charts multiple dependent columns', function(assert) {
  assert.expect(2);
  this.set('mockModel', EmberObject.create({ isRaw: false, pivotOptions: null, save() { } }));
  this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
  this.set('mockColumns', ['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']);
  this.render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel}}`);
  assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
  assert.equal(this.$('.visual-container canvas').length, 1);
});

test('it enables only the pivot mode if the results are raw', function(assert) {
  assert.expect(3);
  this.set('mockModel', EmberObject.create({ isRaw: true, pivotOptions: null, save() { } }));
  this.set('mockRows', RESULTS.SINGLE.records);
  this.set('mockColumns', ['foo', 'timestamp', 'domain']);
  this.render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel}}`);
  assert.equal(this.$('.mode-toggle').length, 0);
  assert.equal(this.$('.visual-container .pivot-table-container').length, 1);
  assert.equal(this.$('.visual-container .pivot-table-container .pvtUi').length, 1);
});

test('it saves pivot table configurations', function(assert) {
  assert.expect(8);
  this.set('mockModel', EmberObject.create({
    isRaw: false,
    isDistribution: true,
    pivotOptions: null,
    save() {
      // Called twice
      assert.ok(true);
    }
  }));
  this.set('mockRows', RESULTS.DISTRIBUTION.records);
  this.set('mockColumns', ['Probability', 'Count', 'Range']);
  this.render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel}}`);

  assert.ok(this.$('.mode-toggle .left-view').hasClass('selected'));
  assert.equal(this.$('.visual-container canvas').length, 1);
  run(() => {
    this.$('.mode-toggle .right-view').click();
  });
  assert.ok(this.$('.mode-toggle .right-view').hasClass('selected'));
  assert.equal(this.$('.visual-container .pivot-table-container .pvtUi').length, 1);
  assert.equal(this.$('.pvtUi select.pvtRenderer').val(), 'Table');
  run(() => {
    this.$('.pivot-table-container select.pvtRenderer').val('Bar Chart').trigger('change');
  });
  return wait().then(() => {
    let options = JSON.parse(this.get('mockModel.pivotOptions'));
    assert.equal(options.rendererName, 'Bar Chart');
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import RESULTS from '../../fixtures/results';

module('Integration | Component | records charter', function(hooks) {
  setupRenderingTest(hooks);

  test('it starts off in line chart mode and allows you to switch to pivot mode', async function(assert) {
    assert.expect(5);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.DISTRIBUTION.records);
    this.set('mockColumns', A(['Probability', 'Count', 'Range']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);

    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.visual-container canvas').length, 1);
    await click('.records-charter .pivot-control');
    assert.dom(this.element.querySelector('.records-charter .pivot-control')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container').length, 1);
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container .pvtUi').length, 1);
  });

  test('it charts a single dependent column', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.SINGLE.records);
    this.set('mockColumns', A(['foo', 'timestamp', 'domain']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.visual-container canvas').length, 1);
  });

  test('it charts multiple dependent columns', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', A(['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.visual-container canvas').length, 1);
  });

  test('it lets you swap to a bar chart', async function(assert) {
    assert.expect(6);
    this.set('mockConfig', EmberObject.create({ isRaw: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', A(['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.dom(this.element.querySelector('.records-charter .chart-control.bar-view')).hasNoClass('active');
    assert.dom(this.element.querySelector('.records-charter .chart-control.pie-view')).hasNoClass('active');
    await click('.records-charter .chart-control.bar-view');
    assert.dom(this.element.querySelector('.records-charter .chart-control.bar-view')).hasClass('active');
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasNoClass('active');
    assert.dom(this.element.querySelector('.records-charter .chart-control.pie-view')).hasNoClass('active');
  });

  test('it lets you swap to a pie chart', async function(assert) {
    assert.expect(6);
    this.set('mockConfig', EmberObject.create({ isRaw: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', A(['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.dom(this.element.querySelector('.records-charter .chart-control.bar-view')).hasNoClass('active');
    assert.dom(this.element.querySelector('.records-charter .chart-control.pie-view')).hasNoClass('active');
    await click('.records-charter .chart-control.pie-view');
    assert.dom(this.element.querySelector('.records-charter .chart-control.pie-view')).hasClass('active');
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasNoClass('active');
    assert.dom(this.element.querySelector('.records-charter .chart-control.bar-view')).hasNoClass('active');
  });

  test('it enables only the pivot mode if the results are raw', async function(assert) {
    assert.expect(4);
    this.set('mockConfig', EmberObject.create({ isRaw: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.SINGLE.records);
    this.set('mockColumns', A(['foo', 'timestamp', 'domain']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);
    assert.equal(this.element.querySelectorAll('.records-charter .chart-control').length, 0);
    assert.dom(this.element.querySelector('.records-charter .pivot-control')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container').length, 1);
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container .pvtUi').length, 1);
  });

  test('it saves pivot table configurations', async function(assert) {
    assert.expect(8);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({
      save() {
        // Called twice
        assert.ok(true);
      }
    }));
    this.set('mockRows', RESULTS.DISTRIBUTION.records);
    this.set('mockColumns', A(['Probability', 'Count', 'Range']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);

    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.visual-container canvas').length, 1);
    await click('.records-charter .pivot-control');
    assert.dom(this.element.querySelector('.records-charter .pivot-control')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container .pvtUi').length, 1);
    assert.equal(this.element.querySelector('.pvtUi select.pvtRenderer').value, 'Table');
    this.element.querySelector('.pivot-table-container select.pvtRenderer').value = 'Bar Chart';
    await triggerEvent('.pivot-table-container select.pvtRenderer', 'change');
    return settled().then(() => {
      let options = JSON.parse(this.get('mockModel.pivotOptions'));
      assert.equal(options.rendererName, 'Bar Chart');
    });
  });

  test('it shows timeseries data without pie charting options', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', A(['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig timeSeriesMode=true}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.records-charter .chart-control.pie-view').length, 0);
  });

  test('it shows timeseries data for distribution data', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_DISTRIBUTION.records);
    this.set('mockColumns', A(['Probability', 'Count', 'Range']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig timeSeriesMode=true}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.records-charter .chart-control.pie-view').length, 0);
  });

  test('it shows timeseries data for only metric data', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_COUNT_DISTINCT.records);
    this.set('mockColumns', A(['foo']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig timeSeriesMode=true}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.records-charter .chart-control.pie-view').length, 0);
  });

  test('it shows timeseries data for numeric non-metric data', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_QUANTILE.records);
    this.set('mockColumns', A(['Quantile', 'Value']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig timeSeriesMode=true}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.records-charter .chart-control.pie-view').length, 0);
  });

  test('it shows line chart if it starts in time series mode but also in pie chart view', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_QUANTILE.records);
    this.set('mockColumns', A(['Quantile', 'Value']));
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig timeSeriesMode=true showPieChart=true}}`);
    assert.dom(this.element.querySelector('.records-charter .chart-control.line-view')).hasClass('active');
    assert.equal(this.element.querySelectorAll('.records-charter .chart-control.pie-view').length, 0);
  });
});

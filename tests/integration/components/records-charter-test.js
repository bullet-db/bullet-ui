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
import RESULTS from 'bullet-ui/tests/fixtures/results';

module('Integration | Component | records charter', function(hooks) {
  setupRenderingTest(hooks);

  test('it starts off in line chart mode and allows you to switch to pivot mode', async function(assert) {
    assert.expect(5);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.DISTRIBUTION.records);
    this.set('mockColumns', A(['Probability', 'Count', 'Range']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}}/>`);

    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.visual-container canvas').exists({ count: 1 });
    await click('.records-charter .pivot-control');
    assert.dom('.records-charter .pivot-control').hasClass('active');
    assert.dom('.visual-container .pivot-table-container').exists({ count: 1 });
    assert.dom('.visual-container .pivot-table-container .pvtUi').exists({ count: 1 });
  });

  test('it charts a single dependent column', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.SINGLE.records);
    this.set('mockColumns', A(['foo', 'timestamp', 'domain']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.visual-container canvas').exists({ count: 1 });
  });

  test('it charts multiple dependent columns', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false }));
    this.set('mockModel', EmberObject.create({ pivotOptions: null, save() { } }));
    this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', A(['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.visual-container canvas').exists({ count: 1 });
  });

  test('it lets you swap to a bar chart', async function(assert) {
    assert.expect(6);
    this.set('mockConfig', EmberObject.create({ isRaw: false }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', A(['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.records-charter .chart-control.bar-view').doesNotHaveClass('active');
    assert.dom('.records-charter .chart-control.pie-view').doesNotHaveClass('active');
    await click('.records-charter .chart-control.bar-view');
    assert.dom('.records-charter .chart-control.bar-view').hasClass('active');
    assert.dom('.records-charter .chart-control.line-view').doesNotHaveClass('active');
    assert.dom('.records-charter .chart-control.pie-view').doesNotHaveClass('active');
  });

  test('it lets you swap to a pie chart', async function(assert) {
    assert.expect(6);
    this.set('mockConfig', EmberObject.create({ isRaw: false }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', A(['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.records-charter .chart-control.bar-view').doesNotHaveClass('active');
    assert.dom('.records-charter .chart-control.pie-view').doesNotHaveClass('active');
    await click('.records-charter .chart-control.pie-view');
    assert.dom('.records-charter .chart-control.pie-view').hasClass('active');
    assert.dom('.records-charter .chart-control.line-view').doesNotHaveClass('active');
    assert.dom('.records-charter .chart-control.bar-view').doesNotHaveClass('active');
  });

  test('it enables only the pivot mode if the results are raw', async function(assert) {
    assert.expect(4);
    this.set('mockConfig', EmberObject.create({ isRaw: true }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.SINGLE.records);
    this.set('mockColumns', A(['foo', 'timestamp', 'domain']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}}/>`);
    assert.dom('.records-charter .chart-control').doesNotExist();
    assert.dom('.records-charter .pivot-control').hasClass('active');
    assert.dom('.visual-container .pivot-table-container').exists({ count: 1 });
    assert.dom('.visual-container .pivot-table-container .pvtUi').exists({ count: 1 });
  });

  test('it saves pivot table configurations', async function(assert) {
    assert.expect(8);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true }));
    this.set('mockModel', EmberObject.create({
      save() {
        // Called twice
        assert.ok(true);
      }
    }));
    this.set('mockRows', RESULTS.DISTRIBUTION.records);
    this.set('mockColumns', A(['Probability', 'Count', 'Range']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.visual-container canvas').exists({ count: 1 });
    await click('.records-charter .pivot-control');
    assert.dom('.records-charter .pivot-control').hasClass('active');
    assert.dom('.visual-container .pivot-table-container .pvtUi').exists({ count: 1 });
    assert.dom('.pvtUi select.pvtRenderer').hasValue('Table');

    this.element.querySelector('.pivot-table-container select.pvtRenderer').value = 'Bar Chart';
    await triggerEvent('.pivot-table-container select.pvtRenderer', 'change');
    await settled();
    await settled();
    let options = JSON.parse(this.mockModel.pivotOptions);
    assert.equal(options.rendererName, 'Bar Chart');
  });

  test('it shows timeseries data without pie charting options', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', A(['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}} @timeSeriesMode={{true}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.records-charter .chart-control.pie-view').doesNotExist();
  });

  test('it shows timeseries data for distribution data', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_DISTRIBUTION.records);
    this.set('mockColumns', A(['Probability', 'Count', 'Range']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}} @timeSeriesMode={{true}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.records-charter .chart-control.pie-view').doesNotExist();
  });

  test('it shows timeseries data for only metric data', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_COUNT_DISTINCT.records);
    this.set('mockColumns', A(['foo']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}} @timeSeriesMode={{true}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.records-charter .chart-control.pie-view').doesNotExist();
  });

  test('it shows timeseries data for numeric non-metric data', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.WINDOWED_QUANTILE.records);
    this.set('mockColumns', A(['Quantile', 'Value']));
    await render(hbs`<RecordsCharter @rows={{this.mockRows}} @columns={{this.mockColumns}} @model={{this.mockModel}}
                                     @config={{this.mockConfig}} @timeSeriesMode={{true}}/>`);
    assert.dom('.records-charter .chart-control.line-view').hasClass('active');
    assert.dom('.records-charter .chart-control.pie-view').doesNotExist();
  });
});

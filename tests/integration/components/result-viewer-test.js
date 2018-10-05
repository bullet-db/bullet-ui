/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | result viewer', function(hooks) {
  setupRenderingTest(hooks);

  function makeQuery(isTimeBased, duration = 0.01) {
    return EmberObject.create({
      window: { isTimeBased },
      duration
    });
  }

  function makeResult(errorWindow, isRaw, hasData, windows) {
    windows.forEach((window, i) => window.index = i);
    return EmberObject.create({
      errorWindow, isRaw, hasData, windows: A(windows)
    });
  }

  function makeWindow(sequence, meta = { }, records = [{ }]) {
    return { sequence, meta, records, created: Date.now() };
  }

  test('it allows auto update toggling if there is data, no errors, and not in aggregate mode', async function(assert) {
    // Error window
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.ok(this.element.querySelector('.auto-update-wrapper').classList.contains('no-visibility'));

    // Raw but Record based window -> auto aggregate
    this.set('mockQuery', makeQuery(false));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.ok(this.element.querySelector('.auto-update-wrapper').classList.contains('no-visibility'));

    // No data
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, false, []));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.ok(this.element.querySelector('.auto-update-wrapper').classList.contains('no-visibility'));

    // Not Raw and Time Based
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.notOk(this.element.querySelector('.auto-update-wrapper').classList.contains('no-visibility'));

    // Raw and Time Based
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.notOk(this.element.querySelector('.auto-update-wrapper').classList.contains('no-visibility'));
  });

  test('it allows time series toggling if there is data, no errors, and a time window', async function(assert) {
    // Error window
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.ok(this.element.querySelector('.time-series-wrapper').classList.contains('no-visibility'));

    // No data
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, false, []));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.ok(this.element.querySelector('.time-series-wrapper').classList.contains('no-visibility'));

    // Raw but Record based window
    this.set('mockQuery', makeQuery(false));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.ok(this.element.querySelector('.time-series-wrapper').classList.contains('no-visibility'));

    // Raw and Time Based
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.notOk(this.element.querySelector('.time-series-wrapper').classList.contains('no-visibility'));
    assert.notOk(this.element.querySelector('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.ok(this.element.querySelector('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden'));

    // Not Raw and Time Based
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.notOk(this.element.querySelector('.time-series-wrapper').classList.contains('no-visibility'));
    assert.notOk(this.element.querySelector('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.ok(this.element.querySelector('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
  });

  test('it does not show window switching controls if there is an error', async function(assert) {
    // Error
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.equal(this.element.querySelectorAll('.window-selector .ember-power-select-trigger').length, 0);

    // Raw Time
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.equal(this.element.querySelectorAll('.window-selector .ember-power-select-trigger').length, 1);

    // Other Time
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.equal(this.element.querySelectorAll('.window-selector .ember-power-select-trigger').length, 1);
  });

  test('it disables the window switching controls if in aggregate mode', async function(assert) {
    // Raw Record -> auto aggregate
    this.set('mockQuery', makeQuery(false));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.ok(this.element.querySelector('.window-selector .ember-power-select-trigger').hasAttribute('aria-disabled'));

    // Timeseries mode -> aggregate mode
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    await click('.time-series-wrapper .mode-toggle .off-view');
    assert.ok(this.element.querySelector('.window-selector .ember-power-select-trigger').hasAttribute('aria-disabled'));
  });

  test('it only shows window timing progress if it is a time window', async function(assert) {
    // Error
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.equal(this.element.querySelectorAll('.window-selector .window-progress-indicator').length, 0);

    // Raw Record -> auto aggregate
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.equal(this.element.querySelectorAll('.window-selector .ember-power-select-trigger').length, 1);
  });

  test('it only shows query timing progress if there is no error', async function(assert) {
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.equal(this.element.querySelectorAll('.control-container .query-progress-indicator').length, 0);

    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.equal(this.element.querySelectorAll('.control-container .query-progress-indicator').length, 1);
  });

  test('it shows a done progress bar if there is no query running', async function(assert) {
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }]));
    this.set('mockQuerier', EmberObject.create({ isRunningQuery: false }));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult querier=mockQuerier}}`);
    assert.equal(this.element.querySelector('.control-container .query-progress-indicator').textContent.trim(), '100%');
  });

  test('it lets you turn auto update on and off', async function(assert) {
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, true, [makeWindow(1), makeWindow(2)]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.ok(this.element.querySelector('.auto-update-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.notOk(this.element.querySelector('.auto-update-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
    let placeHolderText = this.element.querySelector('.window-selector .result-window-placeholder').textContent.trim();
    assert.equal(placeHolderText, 'Switch between 2 windows...');

    await click('.auto-update-wrapper .mode-toggle .off-view');
    assert.ok(this.element.querySelector('.auto-update-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
    assert.notOk(this.element.querySelector('.auto-update-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    let selectedWindowText = this.element.querySelector('.window-selector .ember-power-select-selected-item').textContent.trim();
    assert.equal(this.element.querySelectorAll('.window-selector .result-window-placeholder').length, 0);
    assert.ok(selectedWindowText.indexOf('#2') !== -1);
  });

  test('it lets you turn time series on and off', async function(assert) {
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult(null, false, true, [makeWindow(1), makeWindow(2)]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    // Starts off
    assert.notOk(this.element.querySelector('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.ok(this.element.querySelector('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
    let placeHolderText = this.element.querySelector('.window-selector .result-window-placeholder').textContent.trim();
    assert.equal(placeHolderText, 'Switch between 2 windows...');
    assert.notOk(this.element.querySelector('.window-selector .ember-power-select-trigger').hasAttribute('aria-disabled'));

    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.ok(this.element.querySelector('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.notOk(this.element.querySelector('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
    placeHolderText = this.element.querySelector('.window-selector .result-window-placeholder').textContent.trim();
    assert.equal(placeHolderText, 'Aggregating across your windows...');
    assert.ok(this.element.querySelector('.window-selector .ember-power-select-trigger').hasAttribute('aria-disabled'));
  });

  test('it caches records in time series and also auto updates', async function(assert) {
    this.set('mockQuery', makeQuery(true));
    let mockResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2)]);
    this.set('mockResult', mockResult);
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    // Starts off
    assert.notOk(this.element.querySelector('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.ok(this.element.querySelector('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
    let placeHolderText = this.element.querySelector('.window-selector .result-window-placeholder').textContent.trim();
    assert.equal(placeHolderText, 'Switch between 2 windows...');
    assert.notOk(this.element.querySelector('.window-selector .ember-power-select-trigger').hasAttribute('aria-disabled'));

    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.ok(this.element.querySelector('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.notOk(this.element.querySelector('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
    placeHolderText = this.element.querySelector('.window-selector .result-window-placeholder').textContent.trim();
    assert.equal(placeHolderText, 'Aggregating across your windows...');
    assert.ok(this.element.querySelector('.window-selector .ember-power-select-trigger').hasAttribute('aria-disabled'));
    await click('.view-controls .raw-view');
    assert.equal(this.element.querySelector('.records-title .records-header').textContent.trim(), '2 records in this view');

    // Add some more windows
    let anotherResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2), makeWindow(3)]);
    mockResult.get('windows').pushObject(anotherResult.get('windows').objectAt(2));
    await click('.view-controls .table-view');
    assert.equal(this.element.querySelector('.records-title .records-header').textContent.trim(), '3 records in this view');
  });

  test('it caches records but does not auto update if it is turned off', async function(assert) {
    this.set('mockQuery', makeQuery(true));
    let mockResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2)]);
    this.set('mockResult', mockResult);
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    // Starts off
    assert.notOk(this.element.querySelector('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.ok(this.element.querySelector('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
    let placeHolderText = this.element.querySelector('.window-selector .result-window-placeholder').textContent.trim();
    assert.equal(placeHolderText, 'Switch between 2 windows...');
    assert.notOk(this.element.querySelector('.window-selector .ember-power-select-trigger').hasAttribute('aria-disabled'));

    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.ok(this.element.querySelector('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden'));
    assert.notOk(this.element.querySelector('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden'));
    placeHolderText = this.element.querySelector('.window-selector .result-window-placeholder').textContent.trim();
    assert.equal(placeHolderText, 'Aggregating across your windows...');
    assert.ok(this.element.querySelector('.window-selector .ember-power-select-trigger').hasAttribute('aria-disabled'));
    await click('.view-controls .raw-view');
    assert.equal(this.element.querySelector('.records-title .records-header').textContent.trim(), '2 records in this view');

    // Turn off autoupdate
    await click('.auto-update-wrapper .mode-toggle .off-view');

    // Add some more windows but it should not update
    let anotherResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2), makeWindow(3)]);
    mockResult.get('windows').pushObject(anotherResult.get('windows').objectAt(2));
    await click('.view-controls .table-view');
    assert.equal(this.element.querySelector('.records-title .records-header').textContent.trim(), '2 records in this view');
  });
});

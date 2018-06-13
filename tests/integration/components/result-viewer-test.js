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

module('Integration | Component | result viewer', function(hooks) {
  setupRenderingTest(hooks);

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

  test('it does not show window switching controls if there is an error or if in aggregate mode', async function(assert) {
    // Error
    this.set('mockQuery', makeQuery(true));
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }]));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult}}`);
    assert.equal(this.element.querySelectorAll('.window-selector .ember-power-select-trigger').length, 0);

    // Raw Record -> auto aggregate
    this.set('mockQuery', makeQuery(false));
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }]));
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
    assert.ok(this.element.querySelector('.auto-update-wrapper .mode-toggle .left-view').classList.contains('selected'));
    let selectedWindowText = this.element.querySelector('.window-selector .result-window-placeholder').textContent.trim();
    assert.equal(selectedWindowText, 'Switch between 2 windows...');

    await click('.auto-update-wrapper .mode-toggle .right-view');
    assert.ok(this.element.querySelector('.auto-update-wrapper .mode-toggle .right-view').classList.contains('selected'));
    selectedWindowText = this.element.querySelector('.window-selector .ember-power-select-selected-item').textContent.trim();
    assert.equal(this.element.querySelectorAll('.window-selector .result-window-placeholder').length, 0);
    assert.ok(selectedWindowText.indexOf('#2') !== -1);
  });
});

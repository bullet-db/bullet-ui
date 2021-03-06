/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { selectChoose } from 'ember-power-select/test-support/helpers';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { isNone } from '@ember/utils';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | result viewer', function(hooks) {
  setupRenderingTest(hooks);

  function makeQuery(duration = 0.01) {
    return EmberObject.create({ duration });
  }

  function makeResult(errorWindow, isRaw, hasData, windows, isTimeWindow) {
    windows.forEach((window, i) => window.index = i);
    return EmberObject.create({ errorWindow, hasError: !isNone(errorWindow), isRaw, isTimeWindow, hasData, windows: A(windows) });
  }

  function makeWindow(sequence, meta = { }, records = [{ }]) {
    return { sequence, meta, records, created: Date.now() };
  }

  test('it allows auto update toggling if there is data, no errors, and not in aggregate mode', async function(assert) {
    // Error window
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.auto-update-wrapper').hasClass('no-visibility');

    // Raw but Record based window -> auto aggregate
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }], false));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.auto-update-wrapper').hasClass('no-visibility');

    // No data
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, false, [], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.auto-update-wrapper').hasClass('no-visibility');

    // Not Raw and Time Based
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.auto-update-wrapper').hasNoClass('no-visibility');

    // Raw and Time Based
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.auto-update-wrapper').hasNoClass('no-visibility');
  });

  test('it allows time series toggling if there is data, no errors, and a time window', async function(assert) {
    // Error window
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.time-series-wrapper').hasClass('no-visibility');

    // No data
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, false, [], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.time-series-wrapper').hasClass('no-visibility');

    // Raw but Record based window
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }], false));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.time-series-wrapper').hasClass('no-visibility');

    // Raw and Time Based
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.time-series-wrapper').hasNoClass('no-visibility');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');

    // Not Raw and Time Based
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.time-series-wrapper').hasNoClass('no-visibility');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
  });

  test('it does not show window switching controls if there is an error', async function(assert) {
    // Error
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.window-selector .ember-power-select-trigger').doesNotExist();

    // Raw Time
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.window-selector .ember-power-select-trigger').exists({ count: 1 });

    // Other Time
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.window-selector .ember-power-select-trigger').exists({ count: 1 });
  });

  test('it disables the window switching controls if in aggregate mode', async function(assert) {
    // Raw Record -> auto aggregate
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }], false));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.window-selector .ember-power-select-trigger').hasAria('disabled', 'true');

    // Timeseries mode -> aggregate mode
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    await click('.time-series-wrapper .mode-toggle .off-view');
    assert.dom('.window-selector .ember-power-select-trigger').hasAria('disabled', 'true');
  });

  test('it only shows window timing progress if it is a time window', async function(assert) {
    // Error
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.window-selector .window-progress-indicator').doesNotExist();

    // Raw Record -> auto aggregate
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.window-selector .ember-power-select-trigger').exists({ count: 1 });
  });

  test('it only shows query timing progress if there is no error', async function(assert) {
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult({ }, false, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.control-container .query-progress-indicator').doesNotExist();

    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, true, true, [{ records: [] }], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.control-container .query-progress-indicator').exists({ count: 1 });
  });

  test('it shows a done progress bar if there is no query running', async function(assert) {
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, true, [{ records: [] }], true));
    this.set('mockQuerier', EmberObject.create({ isRunningQuery: false }));
    await render(hbs`{{result-viewer query=mockQuery result=mockResult querier=mockQuerier}}`);
    assert.dom('.control-container .query-progress-indicator').hasText('100%');
  });

  test('it lets you turn auto update on and off', async function(assert) {
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, true, [makeWindow(1), makeWindow(2)], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    assert.dom('.auto-update-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.auto-update-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Switch between 2 windows...');

    await click('.auto-update-wrapper .mode-toggle .off-view');
    assert.dom('.auto-update-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    assert.dom('.auto-update-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').doesNotExist();
    assert.dom('.window-selector .ember-power-select-selected-item').includesText('#2');
  });

  test('it lets you turn time series on and off', async function(assert) {
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, true, [makeWindow(1), makeWindow(2)], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    // Starts off
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Switch between 2 windows...');
    assert.dom('.window-selector .ember-power-select-trigger').doesNotHaveAria('disabled');

    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Aggregating across your windows...');
    assert.dom('.window-selector .ember-power-select-trigger').hasAria('disabled', 'true');
  });

  test('it lets you choose a window', async function(assert) {
    this.set('mockQuery', makeQuery());
    this.set('mockResult', makeResult(null, false, true, [makeWindow(1), makeWindow(2, {}, [{ foo: 'bar' }])], true));
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    // Auto update is on
    assert.dom('.auto-update-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.auto-update-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    // Choose the first window
    await selectChoose('.window-selector', '.ember-power-select-option', 1);
    // Check if window is selected
    assert.dom('.lt-body').includesText('bar');
    // Check if auto update is off
    assert.dom('.auto-update-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.auto-update-wrapper .mode-toggle .off-view').hasAttribute('hidden');
  });

  test('it caches records in time series and also auto updates', async function(assert) {
    this.set('mockQuery', makeQuery());
    let mockResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2)], true);
    this.set('mockResult', mockResult);
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    // Starts off
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Switch between 2 windows...');
    assert.dom('.window-selector .ember-power-select-trigger').doesNotHaveAria('disabled');

    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Aggregating across your windows...');
    assert.dom('.window-selector .ember-power-select-trigger').hasAria('disabled', 'true');
    await click('.view-controls .raw-view');
    assert.dom('.records-title .records-header').hasText('2 records in this view');

    // Add some more windows
    let anotherResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2), makeWindow(3)], true);
    mockResult.get('windows').pushObject(anotherResult.get('windows').objectAt(2));
    await settled();
    assert.dom('.records-title .records-header').hasText('3 records in this view');
  });

  test('it caches records but does not auto update if it is turned off', async function(assert) {
    this.set('mockQuery', makeQuery());
    let mockResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2)], true);
    this.set('mockResult', mockResult);
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    // Starts off
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Switch between 2 windows...');
    assert.dom('.window-selector .ember-power-select-trigger').doesNotHaveAria('disabled');

    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Aggregating across your windows...');
    assert.dom('.window-selector .ember-power-select-trigger').hasAria('disabled', 'true');
    await settled();
    assert.dom('.records-title .records-header').hasText('2 records in this view');

    // Turn off autoupdate
    await click('.auto-update-wrapper .mode-toggle .off-view');

    // Add some more windows but it should not update
    let anotherResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2), makeWindow(3)], true);
    mockResult.get('windows').pushObject(anotherResult.get('windows').objectAt(2));
    await settled();
    assert.dom('.records-title .records-header').hasText('2 records in this view');
  });

  test('it resets the window to no window when autoupdate is on and time series is turned off', async function(assert) {
    this.set('mockQuery', makeQuery());
    let mockResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2)], true);
    this.set('mockResult', mockResult);
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    // Starts off
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    // Starts on
    assert.dom('.auto-update-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.auto-update-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Switch between 2 windows...');
    assert.dom('.window-selector .ember-power-select-trigger').doesNotHaveAria('disabled');

    // Turn on time series
    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Aggregating across your windows...');

    // Turn off
    await click('.time-series-wrapper .mode-toggle .off-view');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Switch between 2 windows...');
    assert.dom('.window-selector .ember-power-select-trigger').doesNotHaveAria('disabled');
  });

  test('it resets the window to the latest window when autoupdate is off and time series is turned off', async function(assert) {
    this.set('mockQuery', makeQuery());
    let mockResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2)], true);
    this.set('mockResult', mockResult);
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    // Starts off
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    // Starts on
    assert.dom('.auto-update-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.auto-update-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Switch between 2 windows...');
    assert.dom('.window-selector .ember-power-select-trigger').doesNotHaveAria('disabled');

    // Turn on time series
    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Aggregating across your windows...');

    // Turn off autoupdate and time series
    await click('.auto-update-wrapper .mode-toggle .off-view');
    assert.dom('.auto-update-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.auto-update-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    await click('.time-series-wrapper .mode-toggle .off-view');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    assert.dom('.window-selector .ember-power-select-selected-item').includesText('#2');
  });

  test('it updates the time series if autoupdate is off while time series data is turned on', async function(assert) {
    this.set('mockQuery', makeQuery());
    let mockResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2)], true);
    this.set('mockResult', mockResult);
    await render(hbs`<ResultViewer @query={{this.mockQuery}} @result={{this.mockResult}}/>`);
    // Starts off
    assert.dom('.time-series-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').hasAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Switch between 2 windows...');
    assert.dom('.window-selector .ember-power-select-trigger').doesNotHaveAria('disabled');

    // Turn off autoupdate
    await click('.auto-update-wrapper .mode-toggle .off-view');
    assert.dom('.auto-update-wrapper .mode-toggle .on-view').doesNotHaveAttribute('hidden');
    assert.dom('.auto-update-wrapper .mode-toggle .off-view').hasAttribute('hidden');

    let anotherResult = makeResult(null, false, true, [makeWindow(1), makeWindow(2), makeWindow(3)], true);
    mockResult.get('windows').pushObject(anotherResult.get('windows').objectAt(2));

    await click('.time-series-wrapper .mode-toggle .on-view');
    assert.dom('.time-series-wrapper .mode-toggle .on-view').hasAttribute('hidden');
    assert.dom('.time-series-wrapper .mode-toggle .off-view').doesNotHaveAttribute('hidden');
    assert.dom('.window-selector .result-window-placeholder').includesText('Aggregating across your windows...');
    assert.dom('.window-selector .ember-power-select-trigger').hasAria('disabled', 'true');
    assert.dom('.records-title .records-header').hasText('3 records in this view');
  });
});

/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | records raw viewer', function(hooks) {
  setupRenderingTest(hooks);

  function repeat(n, item) {
    return Array(n).fill(item);
  }

  test('it renders data in a collapsible json format by default', async function(assert) {
    let data = repeat(1, { foo: 'bar' });
    this.set('mockData', data);

    await render(hbs`<RecordsRawViewer @data={{this.mockData}}/>`);
    assert.dom('.raw-display .pretty-json-container').exists({ count: 1 });
    assert.dom('.json-formatter-row').exists({ count: 3 });
    assert.dom('.json-formatter-open').exists({ count: 2 });
  });

  test('it collapses json properly when the rows and the max levels are low enough', async function(assert) {
    let data = repeat(2, { foo: { bar: 'baz', test: 'foo' } });
    this.set('mockData', data);
    this.set('mockMaxLevels', 3);

    // Max levels = 2 since we only 2 rows
    await render(hbs`<RecordsRawViewer @data={{this.mockData}} @maxLevels={{this.mockMaxLevels}}/>`);
    assert.dom('.raw-display .pretty-json-container').exists({ count: 1 });
    // One Array[2] row + 2 index rows (0 and 1) with 1 foo each = 1 + 2 + 2 = 5. The contents of foo's are lazily rendered
    assert.dom('.json-formatter-row').exists({ count: 5 });
    // But only top and index rows are open
    assert.dom('.json-formatter-open').exists({ count: 3 });
  });

  test('it collapses json properly when the rows and the max levels are greater than the breakpoint', async function(assert) {
    let data = repeat(25, { foo: { bar: 'baz', test: 'foo' } });
    this.set('mockData', data);
    this.set('mockMaxLevels', 2);

    // Max levels is now 1 since we have > 20 rows
    await render(hbs`<RecordsRawViewer @data={{this.mockData}} @maxLevels={{this.mockMaxLevels}}/>`);
    // One Array[2] row + 25 index rows = 1 + 25 = 26. Rest are lazily rendered
    assert.dom('.json-formatter-row').exists({ count: 26 });
    // But only top row is open
    assert.dom('.json-formatter-open').exists({ count: 1 });
  });

  test('it collapses json properly when the rows and the max levels are greater than the breakpoint', async function(assert) {
    let data = repeat(45, { foo: { bar: 'baz', test: 'foo' } });
    this.set('mockData', data);
    this.set('mockMaxLevels', 3);

    // Max levels is now 1 since we have > 40 rows
    await render(hbs`<RecordsRawViewer @data={{this.mockData}} @maxLevels={{this.mockMaxLevels}}/>`);
    // One Array[2] row + 45 index rows = 1 + 45 = 46. Rest are lazily rendered
    assert.dom('.json-formatter-row').exists({ count: 46 });
    // But only top row is open
    assert.dom('.json-formatter-open').exists({ count: 1 });
  });

  test('it renders raw json in a pre tag', async function(assert) {
    assert.expect(5);
    this.set('mockData', null);

    await render(hbs`<RecordsRawViewer @data={{this.mockData}}/>`);
    assert.dom('.raw-display .pretty-json-container').exists({ count: 1 });
    assert.dom('.raw-display .raw-json-display').doesNotExist();
    await click('.mode-toggle .off-view');
    assert.dom('.raw-display .pretty-json-container').doesNotExist();
    assert.dom('.raw-display .raw-json-display').exists({ count: 1 });
    assert.dom('.raw-display .raw-json-display').hasText('');
  });

  test('it renders raw json in a pre tag with the given spacing', async function(assert) {
    assert.expect(5);
    let data = repeat(2, { foo: { bar: 'baz', test: 'foo' } });
    this.set('mockData', data);
    this.set('mockSpacing', 8);

    await render(hbs`<RecordsRawViewer @data={{this.mockData}} spacing=mockSpacing/>`);
    assert.dom('.raw-display .pretty-json-container').exists({ count: 1 });
    assert.dom('.raw-display .raw-json-display').doesNotExist();
    await click('.mode-toggle .off-view');
    assert.dom('.raw-display .pretty-json-container').doesNotExist();
    assert.dom('.raw-display .raw-json-display').exists({ count: 1 });
    assert.dom('.raw-display .raw-json-display').hasText(JSON.stringify(data, null, 8));
  });
});

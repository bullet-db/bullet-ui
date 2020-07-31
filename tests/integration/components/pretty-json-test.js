/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pretty json', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders edge cases and rerenders on change', async function(assert) {
    this.set('mockData', null);
    await render(hbs`<PrettyJson @data={{this.mockData}}/>`);
    assert.dom(this.element).hasText('null');

    await render(hbs`<PrettyJson @data={{this.mockData}}>template block text</PrettyJson>`);
    assert.dom(this.element).hasText('null');

    this.set('mockData', undefined);
    await render(hbs`<PrettyJson @data={{this.mockData}}/>`);
    await settled();
    assert.dom(this.element).hasText('undefined');

    this.set('mockData', []);
    await render(hbs`<PrettyJson @data={{this.mockData}}/>`);
    assert.dom(this.element).hasText('Array[0][]');

    this.set('mockData', { });
    await render(hbs`<PrettyJson @data={{this.mockData}}/>`);
    assert.dom(this.element).hasText('Object{}');
  });

  test('it wraps content in a pre tag', async function(assert) {
    await render(hbs`<PrettyJson/>`);
    assert.dom('pre.pretty-json-container').exists({ count: 1 });
  });

  test('it formats json and opens to two levels by default', async function(assert) {
    this.set('mockData', { foo: { bar: 'baz', test: 'foo' } });
    await render(hbs`<PrettyJson @data={{this.mockData}}/>`);
    assert.dom('.json-formatter-open').exists({ count: 2 });
    assert.dom('.json-formatter-row').exists({ count: 4 });
  });

  test('it collapses json to the given levels', async function(assert) {
    this.set('mockData', { foo: { bar: 'baz', test: 'foo' } });
    this.set('mockLevels', 1);
    await render(hbs`<PrettyJson @data={{this.mockData}} @defaultLevels={{this.mockLevels}}/>`);
    assert.dom('.json-formatter-open').exists({ count: 1 });
  });
});

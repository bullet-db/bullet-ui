/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | query shareable link', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays an input with the query id and query link as contents', async function(assert) {
    let row = EmberObject.create({ content: { id: 'foo' }, queryLink: '/bar/as3FDS3dx' });
    this.set('mockRow', row);

    await render(hbs`<QueryShareableLink @row={{this.mockRow}}/>`);
    assert.dom('input').exists({ count: 1 });
    assert.dom('input').hasAttribute('id', 'query-foo');
    assert.dom('input').hasValue('/bar/as3FDS3dx');
    assert.dom('i.collapse-icon').exists({ count: 1 });
  });

  test('it displays an button that points to the input for clipboard copying', async function(assert) {
    let row = EmberObject.create({ content: { id: 'foo' }, queryLink: '/bar/as3FDS3dx' });
    this.set('mockRow', row);

    await render(hbs`<QueryShareableLink @row={{this.mockRow}}/>`);
    assert.dom('button.copy-btn').exists({ count: 1 });
    assert.dom('button.copy-btn').hasAttribute('data-clipboard-target', '#query-foo');
    assert.dom('button.copy-btn .copy-icon').exists({ count: 1 });
  });

  test('it unsets the expanded property when the collapse icon is clicked', async function(assert) {
    let row = EmberObject.create({ content: { id: 'foo' }, expanded: true, queryLink: '/bar/as3FDS3dx' });
    this.set('mockRow', row);

    await render(hbs`<QueryShareableLink @row={{this.mockRow}}/>`);
    assert.ok(this.get('mockRow.expanded'));
    await click('.collapse-icon');
    assert.notOk(this.get('mockRow.expanded'));
  });
});

/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { triggerCopySuccess } from 'ember-cli-clipboard/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | query information', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a query summary', async function(assert) {
    this.set('mockSnapshot', 'foo bar baz');
    await render(hbs`<QueryInformation @querySnapshot={{this.mockSnapshot}}/>`);
    assert.dom(this.element).includesText('foo bar baz');
  });

  test('it displays an edit, copy to clipboard and a rerun button', async function(assert) {
    await render(hbs`<QueryInformation/>`);
    assert.dom('.link-button').exists({ count: 1 });
    assert.dom('.encode-button').exists({ count: 1 });
    assert.dom('.rerun-button').exists({ count: 1 });
  });

  test('it reruns a query', async function(assert) {
    assert.expect(2);
    this.set('mockReRunClick', () => {
      assert.ok(true);
    });
    await render(hbs`<QueryInformation @reRunClick={{this.mockReRunClick}}/>`);
    assert.dom('.rerun-button').exists({ count: 1 });
    await click('button.rerun-button');
  });

  test('it links to the query', async function(assert) {
    assert.expect(2);
    this.set('mockQueryClick', () => {
      assert.ok(true);
    });
    await render(hbs`<QueryInformation @queryClick={{this.mockQueryClick}}/>`);
    assert.dom('.link-button').exists({ count: 1 });
    await click('button.link-button');
  });

  test('it encodes the query', async function(assert) {
    assert.expect(5);
    this.set('mockEncodedQuery', 'Mock');
    await render(hbs`<QueryInformation @encodedQuery={{this.mockEncodedQuery}}/>`);
    assert.dom('.query-blurb-wrapper .copy-icon').exists({ count: 1 });
    assert.dom('.query-blurb-wrapper .check-icon').doesNotExist();
    assert.dom('button.encode-button').hasAttribute('data-clipboard-text', 'Mock');
    triggerCopySuccess();
    assert.dom('.query-blurb-wrapper .check-icon').exists({ count: 1 });
    assert.dom('.query-blurb-wrapper .copy-icon').doesNotExist();
  });

  // Nested module for stubbing running
  module('running', function(hooks) {
    const QuerierStub = Service.extend({ isRunningQuery: true });

    hooks.beforeEach(function() {
      this.owner.register('service:querier', QuerierStub);
    });

    test('it displays an edit and a cancel button when running a query', async function(assert) {
      await render(hbs`<QueryInformation/>`);
      assert.dom('.link-button').exists({ count: 1 });
      assert.dom('.cancel-button').exists({ count: 1 });
    });

    test('it cancels a query', async function(assert) {
      assert.expect(2);
      this.set('mockCancelClick', () => {
        assert.ok(true);
      });
      await render(hbs`<QueryInformation @cancelClick={{this.mockCancelClick}}/>`);
      assert.dom('.cancel-button').exists({ count: 1 });
      await click('button.cancel-button');
    });
  });
});

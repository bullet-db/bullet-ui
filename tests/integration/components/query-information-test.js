/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | query information', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a query summary', async function(assert) {
    this.set('mockSnapshot', EmberObject.create({ filterSummary: 'foo', fieldsSummary: 'bar', windowSummary: 'baz' }));
    await render(hbs`{{query-information querySnapshot=mockSnapshot}}`);
    let textContent = this.element.textContent.trim();
    assert.ok(textContent.indexOf('foo') !== -1);
    assert.ok(textContent.indexOf('bar') !== -1);
    assert.ok(textContent.indexOf('baz') !== -1);
  })

  test('it displays an edit and a rerun button', async function(assert) {
    await render(hbs`{{query-information}}`);
    assert.equal(this.element.querySelectorAll('button.link-button').length, 1);
    assert.equal(this.element.querySelectorAll('button.rerun-button').length, 1);
  }),

  test('it displays an edit and a cancel button when running a query', async function(assert) {
    this.set('mockQuerier', EmberObject.create({ isRunningQuery: true }));
    await render(hbs`{{query-information querier=mockQuerier}}`);
    assert.equal(this.element.querySelectorAll('button.link-button').length, 1);
    assert.equal(this.element.querySelectorAll('button.cancel-button').length, 1);
  })
});

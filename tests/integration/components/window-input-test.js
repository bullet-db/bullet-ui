/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import MockQuery from '../../helpers/mocked-query';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';

module('Integration | Component | window-input', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders without window', async function(assert) {
    assert.expect(2);

    let mockQuery = MockQuery.create();
    this.set('mockQuery', mockQuery);
    await render(hbs `{{window-input query=mockQuery}}`);
    assert.equal(this.element.querySelector('.subsection-header').innerText.trim(), 'No Window');
    assert.equal(this.element.querySelectorAll('.add-button').length, 1);
  });

  test('it renders when aggregation is raw', async function(assert) {
    assert.expect(17);

    let mockQuery = MockQuery.create();
    mockQuery.setWindow(EMIT_TYPES.get('TIME'), 2, INCLUDE_TYPES.get('WINDOW'));
    mockQuery.addAggregation(AGGREGATIONS.get('RAW'));
    this.set('mockQuery', mockQuery);
    this.set('mockReplaceWindow', (emitType, emitEvery, includeType) => {
      assert.ok(true);
      mockQuery.setWindow(emitType, emitEvery, includeType);
      return resolve();
    });

    await render(hbs `{{window-input replaceWindow=mockReplaceWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.ember-radio-button').length, 4);
    assert.ok(this.element.querySelector('#time-based').parentElement.classList.contains('checked'));
    assert.notOk(this.element.querySelector('#record-based').parentElement.classList.contains('checked'));
    assert.ok(this.element.querySelector('#include-window').parentElement.classList.contains('checked'));
    assert.notOk(this.element.querySelector('#include-all').parentElement.classList.contains('checked'));
    assert.equal(this.element.querySelector('#include-all').disabled, true);
    assert.equal(this.element.querySelector('.validated-input input').value, 2);

    await click(this.element.querySelector('#record-based'));
    assert.equal(this.element.querySelectorAll('.ember-radio-button').length, 2);
    assert.notOk(this.element.querySelector('#time-based').parentElement.classList.contains('checked'));
    assert.ok(this.element.querySelector('#record-based').parentElement.classList.contains('checked'));
    assert.equal(this.element.querySelector('.validated-input input').disabled, true);
    assert.equal(this.element.querySelector('.validated-input input').value, 1);

    await click(this.element.querySelector('#time-based'));
    assert.equal(this.element.querySelectorAll('.ember-radio-button').length, 4);
    assert.ok(this.element.querySelector('#time-based').parentElement.classList.contains('checked'));
    assert.notOk(this.element.querySelector('#record-based').parentElement.classList.contains('checked'));
  });

  test('it renders when aggregation is not raw', async function(assert) {
    assert.expect(10);

    let mockQuery = MockQuery.create();
    mockQuery.setWindow(EMIT_TYPES.get('TIME'), 2, INCLUDE_TYPES.get('WINDOW'));
    mockQuery.addAggregation(AGGREGATIONS.get('GROUP'));
    this.set('mockQuery', mockQuery);
    this.set('mockReplaceWindow', (emitType, emitEvery, includeType) => {
      assert.ok(true);
      mockQuery.setWindow(emitType, emitEvery, includeType);
      return resolve();
    });

    await render(hbs `{{window-input replaceWindow=mockReplaceWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.ember-radio-button').length, 4);
    assert.ok(this.element.querySelector('#time-based').parentElement.classList.contains('checked'));
    assert.notOk(this.element.querySelector('#record-based').parentElement.classList.contains('checked'));
    assert.ok(this.element.querySelector('#include-window').parentElement.classList.contains('checked'));
    assert.notOk(this.element.querySelector('#include-all').parentElement.classList.contains('checked'));
    assert.equal(this.element.querySelector('#record-based').disabled, true);
    assert.equal(this.element.querySelector('.validated-input input').value, 2);

    await click(this.element.querySelector('#include-all'));
    assert.notOk(this.element.querySelector('#include-window').parentElement.classList.contains('checked'));
    assert.ok(this.element.querySelector('#include-all').parentElement.classList.contains('checked'));
  });

  test('it renders when changing aggregation type', async function(assert) {
    assert.expect(14);

    let mockQuery = MockQuery.create();
    mockQuery.setWindow(EMIT_TYPES.get('RECORD'), 1, INCLUDE_TYPES.get('WINDOW'));
    mockQuery.addAggregation(AGGREGATIONS.get('RAW'));
    this.set('mockQuery', mockQuery);
    this.set('mockReplaceWindow', (emitType, emitEvery, includeType) => {
      assert.ok(true);
      mockQuery.setWindow(emitType, emitEvery, includeType);
      return resolve();
    });

    await render(hbs `{{window-input replaceWindow=mockReplaceWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.ember-radio-button').length, 2);
    assert.notOk(this.element.querySelector('#time-based').parentElement.classList.contains('checked'));
    assert.ok(this.element.querySelector('#record-based').parentElement.classList.contains('checked'));

    mockQuery.addAggregation(AGGREGATIONS.get('GROUP'));
    await render(hbs `{{window-input replaceWindow=mockReplaceWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.ember-radio-button').length, 4);
    assert.ok(this.element.querySelector('#time-based').parentElement.classList.contains('checked'));
    assert.notOk(this.element.querySelector('#record-based').parentElement.classList.contains('checked'));
    assert.equal(this.element.querySelector('#record-based').disabled, true);

    await click(this.element.querySelector('#include-all'));
    assert.notOk(this.element.querySelector('#include-window').parentElement.classList.contains('checked'));
    assert.ok(this.element.querySelector('#include-all').parentElement.classList.contains('checked'));

    mockQuery.addAggregation(AGGREGATIONS.get('RAW'));
    await render(hbs `{{window-input replaceWindow=mockReplaceWindow query=mockQuery}}`);
    assert.ok(this.element.querySelector('#include-window').parentElement.classList.contains('checked'));
    assert.notOk(this.element.querySelector('#include-all').parentElement.classList.contains('checked'));
  });

  test('it adds window', async function(assert) {
    assert.expect(4);

    let mockQuery = MockQuery.create();
    this.set('mockQuery', mockQuery);
    this.set('mockAddWindow', () => {
      assert.ok(true);
      mockQuery.setWindow(EMIT_TYPES.get('TIME'), 2, INCLUDE_TYPES.get('WINDOW'));
      return resolve();
    });

    await render(hbs `{{window-input addWindow=mockAddWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.add-button').length, 1);

    await click('.add-button');
    assert.equal(this.element.querySelectorAll('.add-button').length, 0);
    assert.equal(this.element.querySelectorAll('.remove-button').length, 1);
  });

  test('it closes window', async function(assert) {
    assert.expect(5);

    let mockQuery = MockQuery.create();
    mockQuery.setWindow(EMIT_TYPES.get('TIME'), 2, INCLUDE_TYPES.get('WINDOW'));
    mockQuery.addAggregation(AGGREGATIONS.get('GROUP'));
    this.set('mockQuery', mockQuery);
    this.set('mockRemoveWindow', () => {
      assert.ok(true);
      mockQuery.removeWindow();
      return resolve();
    });

    await render(hbs `{{window-input removeWindow=mockRemoveWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.remove-button').length, 1);

    await click('.remove-button');
    assert.equal(this.element.querySelectorAll('.remove-button').length, 0);
    assert.equal(this.element.querySelector('.subsection-header').innerText.trim(), 'No Window');
    assert.equal(this.element.querySelectorAll('.add-button').length, 1);
  });
});

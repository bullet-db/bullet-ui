/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import MockQuery from '../../helpers/mocked-query';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';

module('Integration | Component | window-input', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders without window', async function(assert) {
    assert.expect(1);

    let mockQuery = MockQuery.create();
    this.set('mockQuery', mockQuery);
    await render(hbs `{{window-input query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.no-window-section .add-button').length, 1);
  });

  test('it renders when aggregation is raw', async function(assert) {
    assert.expect(17);

    let mockQuery = MockQuery.create();
    mockQuery.addWindow(EMIT_TYPES.get('TIME'), 2, INCLUDE_TYPES.get('WINDOW'));
    mockQuery.addAggregation(AGGREGATIONS.get('RAW'));
    this.set('mockQuery', mockQuery);
    this.set('mockReplaceWindow', (emitType, emitEvery, includeType) => {
      assert.ok(true);
      mockQuery.addWindow(emitType, emitEvery, includeType);
      return resolve();
    });

    await render(hbs `{{window-input replaceWindow=mockReplaceWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.radio-button').length, 4);
    assert.dom(this.element.querySelector('#time-based').parentElement).hasClass('checked');
    assert.dom(this.element.querySelector('#record-based').parentElement).hasNoClass('checked');
    assert.dom(this.element.querySelector('#include-window').parentElement).hasClass('checked');
    assert.dom(this.element.querySelector('#include-all').parentElement).hasNoClass('checked');
    assert.equal(this.element.querySelector('#include-all').disabled, true);
    assert.equal(this.element.querySelector('.validated-input input').value, 2);

    await click('#record-based');
    assert.equal(this.element.querySelectorAll('.radio-button').length, 2);
    assert.dom(this.element.querySelector('#time-based').parentElement).hasNoClass('checked');
    assert.dom(this.element.querySelector('#record-based').parentElement).hasClass('checked');
    assert.equal(this.element.querySelector('.validated-input input').disabled, true);
    assert.equal(this.element.querySelector('.validated-input input').value, 1);

    await click('#time-based');
    assert.equal(this.element.querySelectorAll('.radio-button').length, 4);
    assert.dom(this.element.querySelector('#time-based').parentElement).hasClass('checked');
    assert.dom(this.element.querySelector('#record-based').parentElement).hasNoClass('checked');
  });

  test('it renders when aggregation is not raw', async function(assert) {
    assert.expect(10);

    let mockQuery = MockQuery.create();
    mockQuery.addWindow(EMIT_TYPES.get('TIME'), 2, INCLUDE_TYPES.get('WINDOW'));
    mockQuery.addAggregation(AGGREGATIONS.get('GROUP'));
    this.set('mockQuery', mockQuery);
    this.set('mockReplaceWindow', (emitType, emitEvery, includeType) => {
      assert.ok(true);
      mockQuery.addWindow(emitType, emitEvery, includeType);
      return resolve();
    });

    await render(hbs `{{window-input replaceWindow=mockReplaceWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.radio-button').length, 4);
    assert.dom(this.element.querySelector('#time-based').parentElement).hasClass('checked');
    assert.dom(this.element.querySelector('#record-based').parentElement).hasNoClass('checked');
    assert.dom(this.element.querySelector('#include-window').parentElement).hasClass('checked');
    assert.dom(this.element.querySelector('#include-all').parentElement).hasNoClass('checked');
    assert.equal(this.element.querySelector('#record-based').disabled, true);
    assert.equal(this.element.querySelector('.validated-input input').value, 2);

    await click('#include-all');
    assert.dom(this.element.querySelector('#include-window').parentElement).hasNoClass('checked');
    assert.dom(this.element.querySelector('#include-all').parentElement).hasClass('checked');
  });

  test('it adds a window', async function(assert) {
    assert.expect(4);

    let mockQuery = MockQuery.create();
    this.set('mockQuery', mockQuery);
    this.set('mockAddWindow', () => {
      assert.ok(true);
      mockQuery.addWindow(EMIT_TYPES.get('TIME'), 2, INCLUDE_TYPES.get('WINDOW'));
      return resolve();
    });

    await render(hbs `{{window-input addWindow=mockAddWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.add-button').length, 1);

    await click('.add-button');
    assert.equal(this.element.querySelectorAll('.add-button').length, 0);
    assert.equal(this.element.querySelectorAll('.delete-button').length, 1);
  });

  test('it deletes a window', async function(assert) {
    assert.expect(4);

    let mockQuery = MockQuery.create();
    mockQuery.addWindow(EMIT_TYPES.get('TIME'), 2, INCLUDE_TYPES.get('WINDOW'));
    mockQuery.addAggregation(AGGREGATIONS.get('GROUP'));
    this.set('mockQuery', mockQuery);
    this.set('mockDeleteWindow', () => {
      assert.ok(true);
      mockQuery.deleteWindow();
      return resolve();
    });

    await render(hbs `{{window-input deleteWindow=mockDeleteWindow query=mockQuery}}`);
    assert.equal(this.element.querySelectorAll('.delete-button').length, 1);

    await click('.delete-button');
    assert.equal(this.element.querySelectorAll('.delete-button').length, 0);
    assert.equal(this.element.querySelectorAll('.no-window-section .add-button').length, 1);
  });
});

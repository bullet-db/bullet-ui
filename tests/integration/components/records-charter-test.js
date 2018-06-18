/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RESULTS from '../../fixtures/results';

module('Integration | Component | records charter', function(hooks) {
  setupRenderingTest(hooks);

  test('it starts off in chart mode and allows you to switch to pivot mode', async function(assert) {
    assert.expect(5);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.DISTRIBUTION.records);
    this.set('mockColumns', ['Probability', 'Count', 'Range']);
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);

    assert.ok(this.element.querySelector('.mode-toggle .left-view').classList.contains('selected'));
    assert.equal(this.element.querySelectorAll('.visual-container canvas').length, 1);
    await click('.mode-toggle .right-view');
    assert.ok(this.element.querySelector('.mode-toggle .right-view').classList.contains('selected'));
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container').length, 1);
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container .pvtUi').length, 1);
  });

  test('it charts a single dependent column', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.SINGLE.records);
    this.set('mockColumns', ['foo', 'timestamp', 'domain']);
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);
    assert.ok(this.element.querySelector('.mode-toggle .left-view').classList.contains('selected'));
    assert.equal(this.element.querySelectorAll('.visual-container canvas').length, 1);
  });

  test('it charts multiple dependent columns', async function(assert) {
    assert.expect(2);
    this.set('mockConfig', EmberObject.create({ isRaw: false, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
    this.set('mockColumns', ['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']);
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);
    assert.ok(this.element.querySelector('.mode-toggle .left-view').classList.contains('selected'));
    assert.equal(this.element.querySelectorAll('.visual-container canvas').length, 1);
  });

  test('it enables only the pivot mode if the results are raw', async function(assert) {
    assert.expect(3);
    this.set('mockConfig', EmberObject.create({ isRaw: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({ save() { } }));
    this.set('mockRows', RESULTS.SINGLE.records);
    this.set('mockColumns', ['foo', 'timestamp', 'domain']);
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);
    assert.equal(this.element.querySelectorAll('.mode-toggle').length, 0);
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container').length, 1);
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container .pvtUi').length, 1);
  });

  test('it saves pivot table configurations', async function(assert) {
    assert.expect(8);
    this.set('mockConfig', EmberObject.create({ isRaw: false, isDistribution: true, pivotOptions: null }));
    this.set('mockModel', EmberObject.create({
      save() {
        // Called twice
        assert.ok(true);
      }
    }));
    this.set('mockRows', RESULTS.DISTRIBUTION.records);
    this.set('mockColumns', ['Probability', 'Count', 'Range']);
    await render(hbs`{{records-charter rows=mockRows columns=mockColumns model=mockModel config=mockConfig}}`);

    assert.ok(this.element.querySelector('.mode-toggle .left-view').classList.contains('selected'));
    assert.equal(this.element.querySelectorAll('.visual-container canvas').length, 1);
    await click('.mode-toggle .right-view');
    assert.ok(this.element.querySelector('.mode-toggle .right-view').classList.contains('selected'));
    assert.equal(this.element.querySelectorAll('.visual-container .pivot-table-container .pvtUi').length, 1);
    assert.equal(this.element.querySelector('.pvtUi select.pvtRenderer').value, 'Table');
    this.element.querySelector('.pivot-table-container select.pvtRenderer').value = 'Bar Chart';
    await triggerEvent('.pivot-table-container select.pvtRenderer', 'change');
    return settled().then(() => {
      let options = JSON.parse(this.get('mockModel.pivotOptions'));
      assert.equal(options.rendererName, 'Bar Chart');
    });
  });
});

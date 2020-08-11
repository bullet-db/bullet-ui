/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | records table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a table when rows and columns are passed in', async function(assert) {
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 1 }, { foo: 2 }, { foo: 3 }]));
    await render(hbs`<RecordsTable @columnNames={{this.columns}} @rows={{this.rows}}/>`);
    assert.dom('.lt-head .lt-column').hasText('foo');
    assert.dom('.lt-body .lt-row .lt-cell').exists({ count: 3 });
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '123');
  });

  test('it sorts a column on click', async function(assert) {
    assert.expect(3);
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 2 }, { foo: 1 }, { foo: 3 }]));
    await render(hbs`<RecordsTable @columnNames={{this.columns}} @rows={{this.rows}}/>`);
    assert.dom('.lt-head .lt-column.is-sortable').exists({ count: 1 });
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '213');
    await click('.lt-head .lt-column.is-sortable');
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '123');
  });

  test('it keeps a column sorted when receiving new data', async function(assert) {
    assert.expect(5);
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 2 }, { foo: 1 }, { foo: 3 }]));
    await render(hbs`<RecordsTable @columnNames={{this.columns}} @rows={{this.rows}}/>`);
    assert.dom('.lt-head .lt-column.is-sortable').exists({ count: 1 });
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '213');
    await click('.lt-head .lt-column.is-sortable');
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '123');
    this.set('rows', A([{ foo: 2 }, { foo: 9 }, { foo: 1 }, { foo: 3 }]));
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '1239');
    // Descending
    await click('.lt-head .lt-column.is-sortable');
    this.set('rows', A([{ foo: 2 }, { foo: 0 }, { foo: 1 }, { foo: 3 }]));
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '3210');
  });

  test('it resets the table when switching to and from time series', async function(assert) {
    assert.expect(5);
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 2 }, { foo: 1 }, { foo: 3 }]));
    this.set('mockTimeSeriesMode', false);
    await render(hbs`<RecordsTable @columnNames={{this.columns}} @rows={{this.rows}}
                                   @timeSeriesMode={{this.mockTimeSeriesMode}}/>`);
    assert.dom(this.element.querySelector('.lt-head')).hasText('foo');
    // Does not update
    this.set('columns', A(['bar']));
    await settled();
    assert.dom(this.element.querySelector('.lt-head')).hasText('foo');
    //  Now it updates
    this.set('mockTimeSeriesMode', true);
    await settled();
    assert.dom(this.element.querySelector('.lt-head')).hasText('bar');
    // Does not update
    this.set('columns', A(['foo']));
    await settled();
    assert.dom(this.element.querySelector('.lt-head')).hasText('bar');
    //  Now it updates
    this.set('mockTimeSeriesMode', false);
    await settled();
    assert.dom(this.element.querySelector('.lt-head')).hasText('foo');
  });
});

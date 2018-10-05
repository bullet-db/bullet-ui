/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | records table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a table when rows and columns are passed in', async function(assert) {
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 1 }, { foo: 2 }, { foo: 3 }]));
    await render(hbs`{{records-table columnNames=columns rawRows=rows}}`);
    assert.equal(this.element.querySelector('.lt-head .lt-column').textContent.trim(), 'foo');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell').length, 3);
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '123');
  });

  test('it sorts a column on click', async function(assert) {
    assert.expect(3);
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 2 }, { foo: 1 }, { foo: 3 }]));
    await render(hbs`{{records-table columnNames=columns rawRows=rows}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column.is-sortable').length, 1);
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '213');
    await click('.lt-head .lt-column.is-sortable');
    assert.equal(this.element.querySelector('.lt-body').textContent.replace(/\s/g, ''), '123');
  });

  test('it keeps a column sorted when receiving new data', async function(assert) {
    assert.expect(5);
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 2 }, { foo: 1 }, { foo: 3 }]));
    await render(hbs`{{records-table columnNames=columns rawRows=rows}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column.is-sortable').length, 1);
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
    await render(hbs`{{records-table columnNames=columns rawRows=rows timeSeriesMode=mockTimeSeriesMode}}`);
    assert.equal(this.element.querySelector('.lt-head').textContent.replace(/\s/g, ''), 'foo');
    // Does not update
    this.set('columns', A(['bar']));
    assert.equal(this.element.querySelector('.lt-head').textContent.replace(/\s/g, ''), 'foo');
    //  Now it updates
    this.set('mockTimeSeriesMode', true);
    assert.equal(this.element.querySelector('.lt-head').textContent.replace(/\s/g, ''), 'bar');
    // Does not update
    this.set('columns', A(['foo']));
    assert.equal(this.element.querySelector('.lt-head').textContent.replace(/\s/g, ''), 'bar');
    //  Now it updates
    this.set('mockTimeSeriesMode', false);
    assert.equal(this.element.querySelector('.lt-head').textContent.replace(/\s/g, ''), 'foo');
  });

  // Skip it until https://github.com/offirgolan/ember-light-table/issues/562 is fixed.
  skip('it paginates the results by increments', async function(assert) {
    assert.expect(1);
    this.set('columns', A(['foo']));
    let mockRows = [];
    for (let i = 0; i < 100; ++i) {
      mockRows.push({ foo: i });
    }
    this.set('rows', A(mockRows));
    await render(hbs`{{records-table columnNames=columns rawRows=rows pageSize=10}}`);
    let elements = this.element.querySelectorAll('.lt-row');
    let count = 0;
    elements.forEach(e => {
      if (!e.classList.contains('lt-is-loading')) {
        count += 1;
      }
    });
    assert.equal(count, 10);
  });
});

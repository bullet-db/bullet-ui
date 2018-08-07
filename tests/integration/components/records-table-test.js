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
    let text = this.element.querySelector('.lt-body').textContent;
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '123');
  });

  test('it sorts a column on click', async function(assert) {
    assert.expect(3);
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 2 }, { foo: 1 }, { foo: 3 }]));
    await render(hbs`{{records-table columnNames=columns rawRows=rows}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column.is-sortable').length, 1);
    let text = this.element.querySelector('.lt-body').textContent;
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '213');
    await click('.lt-head .lt-column.is-sortable');
    text = this.element.querySelector('.lt-body').textContent;
    spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '123');
  });

  test('it paginates the results by increments', async function(assert) {
    // Used to be skipped till https://github.com/offirgolan/ember-light-table/issues/562 was fixed.
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

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
    assert.equal(this.$('.lt-head .lt-column').text().trim(), 'foo');
    assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 3);
    let text = this.$('.lt-body .lt-row .lt-cell').text();
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '123');
  });

  test('it sorts a column on click', async function(assert) {
    assert.expect(3);
    this.set('columns', A(['foo']));
    this.set('rows', A([{ foo: 2 }, { foo: 1 }, { foo: 3 }]));
    await render(hbs`{{records-table columnNames=columns rawRows=rows}}`);
    assert.equal(this.$('.lt-head .lt-column.is-sortable').length, 1);
    let text = this.$('.lt-body .lt-row .lt-cell').text();
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '213');
    await click('.lt-head .lt-column.is-sortable');
    text = this.$('.lt-body .lt-row .lt-cell').text();
    spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '123');
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
    assert.equal(this.$('.lt-row:not(".lt-is-loading")').length, 10);
  });
});

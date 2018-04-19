/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('records-table', 'Integration | Component | records table', {
  integration: true
});

test('it renders a table when rows and columns are passed in', function(assert) {
  this.set('columns', A(['foo']));
  this.set('rows', A([{ foo: 1 }, { foo: 2 }, { foo: 3 }]));
  this.render(hbs`{{records-table columnNames=columns rawRows=rows}}`);
  assert.equal(this.$('.lt-head .lt-column').text().trim(), 'foo');
  assert.equal(this.$('.lt-body .lt-row .lt-cell').length, 3);
  let text = this.$('.lt-body .lt-row .lt-cell').text();
  let spaceLess = text.replace(/\s/g, '');
  assert.equal(spaceLess, '123');
});

test('it sorts a column on click', function(assert) {
  assert.expect(3);
  this.set('columns', A(['foo']));
  this.set('rows', A([{ foo: 2 }, { foo: 1 }, { foo: 3 }]));
  this.render(hbs`{{records-table columnNames=columns rawRows=rows}}`);
  assert.equal(this.$('.lt-head .lt-column.is-sortable').length, 1);
  let text = this.$('.lt-body .lt-row .lt-cell').text();
  let spaceLess = text.replace(/\s/g, '');
  assert.equal(spaceLess, '213');
  this.$('.lt-head .lt-column.is-sortable').click();
  return wait().then(() => {
    text = this.$('.lt-body .lt-row .lt-cell').text();
    spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '123');
  });
});

test('it paginates the results by increments', function(assert) {
  assert.expect(1);
  this.set('columns', A(['foo']));
  let mockRows = [];
  for (let i = 0; i < 100; ++i) {
    mockRows.push({ foo: i });
  }
  this.set('rows', A(mockRows));
  this.render(hbs`{{records-table columnNames=columns rawRows=rows pageSize=10}}`);
  assert.equal(this.$('.lt-row:not(".lt-is-loading")').length, 10);
});

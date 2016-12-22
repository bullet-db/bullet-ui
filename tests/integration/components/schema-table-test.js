/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import MockColumn from '../../helpers/mocked-column';

moduleForComponent('schema-table', 'Integration | Component | schema table', {
  integration: true
});

test('it renders the name, type and description of columns', function(assert) {
  let column = MockColumn.create({ name: 'foo', type: 'STRING', description: 'description' });
  let columns = Ember.A([column]);
  this.set('mockColumns', columns);

  this.render(hbs`{{schema-table fields=mockColumns}}`);
  assert.equal(this.$('.lt-head .lt-column').eq(0).text().trim(), 'Field');
  assert.equal(this.$('.lt-head .lt-column').eq(1).text().trim(), 'Type');
  assert.equal(this.$('.lt-head .lt-column').eq(2).text().trim(), 'Description');
  assert.equal(this.$('.lt-body .lt-row').length, 1);
  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-name-entry').text().trim(), 'foo');
  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-type-entry').text().trim(), 'STRING');
  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-description-entry').text().trim(), 'description');
});

test('it does not expand non-complex columns', function(assert) {
  let column = MockColumn.create({ name: 'foo', type: 'MAP', subtype: 'BOOLEAN', description: 'description' });
  let columns = Ember.A([column]);
  this.set('mockColumns', columns);

  this.render(hbs`{{schema-table fields=mockColumns}}`);
  assert.equal(this.$('.lt-body .lt-row').length, 1);
  assert.equal(this.$('.lt-body .lt-expanded-row').length, 0);

  this.$('.lt-body .lt-row').click();
  return wait().then(() => {
    assert.equal(this.$('.lt-body .lt-expanded-row').length, 0);
  });
});

test('it renders and expands complex columns', function(assert) {
  let column = MockColumn.create({ name: 'foo', type: 'MAP', subtype: 'BOOLEAN', description: 'description' });
  column.addEnumeration('bar', 'nested 1');
  column.addEnumeration('baz', 'nested 2');
  let columns = Ember.A([column]);
  this.set('mockColumns', columns);

  this.render(hbs`{{schema-table fields=mockColumns}}`);
  assert.equal(this.$('.lt-head .lt-column').eq(0).text().trim(), 'Field');
  assert.equal(this.$('.lt-head .lt-column').eq(1).text().trim(), 'Type');
  assert.equal(this.$('.lt-head .lt-column').eq(2).text().trim(), 'Description');
  assert.equal(this.$('.lt-body .lt-row.has-enumerations').length, 1);

  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-name-entry').text().trim(), 'foo');
  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-type-entry').text().trim(), 'MAP OF BOOLEANS');
  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-description-entry').text().trim(), 'description');

  assert.equal(this.$('.lt-body .lt-expanded-row').length, 0);

  this.$('.lt-body .lt-row').click();
  return wait().then(() => {
    assert.equal(this.$('.lt-body .lt-expanded-row').length, 1);
    assert.equal(this.$('.lt-body .lt-expanded-row .schema-table.is-nested').length, 1);
    assert.equal(this.$('.lt-body .lt-expanded-row .schema-table .lt-row').length, 2);
    assert.equal(this.$('.lt-body .lt-expanded-row .lt-cell .schema-name-entry').eq(0).text().trim(), 'bar');
    assert.equal(this.$('.lt-body .lt-expanded-row .lt-cell .schema-type-entry').eq(0).text().trim(), 'BOOLEAN');
    assert.equal(this.$('.lt-body .lt-expanded-row .lt-cell .schema-description-entry').eq(0).text().trim(), 'nested 1');

    assert.equal(this.$('.lt-body .lt-expanded-row .lt-cell .schema-name-entry').eq(1).text().trim(), 'baz');
    assert.equal(this.$('.lt-body .lt-expanded-row .lt-cell .schema-type-entry').eq(1).text().trim(), 'BOOLEAN');
    assert.equal(this.$('.lt-body .lt-expanded-row .lt-cell .schema-description-entry').eq(1).text().trim(), 'nested 2');
  });
});

test('it default sorts by name ascending and can sort', function(assert) {
  let columnA = MockColumn.create({ name: 'foo', type: 'STRING', description: 'description' });
  let columnB = MockColumn.create({ name: 'bar', type: 'STRING', description: 'description' });
  let columnC = MockColumn.create({ name: 'qux', type: 'STRING', description: 'description' });
  let columns = Ember.A([columnA, columnB, columnC]);
  this.set('mockColumns', columns);

  this.render(hbs`{{schema-table fields=mockColumns}}`);
  assert.equal(this.$('.lt-body .lt-row').length, 3);
  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-name-entry').eq(0).text().trim(), 'bar');
  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-name-entry').eq(1).text().trim(), 'foo');
  assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-name-entry').eq(2).text().trim(), 'qux');

  // Click twice for descending sort
  this.$('.lt-head .lt-column.is-sortable').eq(0).click();
  this.$('.lt-head .lt-column.is-sortable').eq(0).click();
  return wait().then(() => {
    assert.equal(this.$('.lt-body .lt-row').length, 3);
    assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-name-entry').eq(0).text().trim(), 'qux');
    assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-name-entry').eq(1).text().trim(), 'foo');
    assert.equal(this.$('.lt-body .lt-row .lt-cell .schema-name-entry').eq(2).text().trim(), 'bar');
  });
});


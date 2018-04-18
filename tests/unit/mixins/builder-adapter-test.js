/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import EmberObject from '@ember/object';
import BuilderAdapterMixin from 'bullet-ui/mixins/builder-adapter';
import { module, test } from 'qunit';
import MockColumn from '../../helpers/mocked-column';

module('Unit | Mixin | builder adapter');

test('it sets default builder options with the right operators', function(assert) {
  let BuilderAdapterObject = EmberObject.extend(BuilderAdapterMixin);
  let subject = BuilderAdapterObject.create();
  assert.equal(subject.builderOptions().operators.length, 13);
  assert.ok(subject.builderOptions().sqlOperators.rlike);
});

test('it works fine if there are no columns', function(assert) {
  let BuilderAdapterObject = EmberObject.extend(BuilderAdapterMixin);
  let subject = BuilderAdapterObject.create();
  assert.ok(isEmpty(subject.builderFilters()));
  assert.ok(isEmpty(subject.builderFilters(null)));
  assert.ok(isEmpty(subject.builderFilters(A())));
});

test('it converts unknown types to simple builder filters', function(assert) {
  let BuilderAdapterObject = EmberObject.extend(BuilderAdapterMixin);
  let subject = BuilderAdapterObject.create();
  let mockColumns = A();
  mockColumns.push(MockColumn.create({ name: 'foo', type: 'BIGINTEGER' }));
  mockColumns.push(MockColumn.create({ name: 'bar', type: 'MAP' }));
  mockColumns.push(MockColumn.create({ name: 'baz', type: 'LIST' }));
  let actualFilters = subject.builderFilters(mockColumns);

  assert.equal(actualFilters.length, 3);

  assert.equal(actualFilters[0].id, 'foo');
  assert.equal(actualFilters[0].operators.length, 2);
  assert.equal(actualFilters[0].type, 'integer');

  assert.equal(actualFilters[1].id, 'bar');
  assert.equal(actualFilters[1].operators.length, 2);
  assert.equal(actualFilters[1].type, 'integer');

  assert.equal(actualFilters[2].id, 'baz');
  assert.equal(actualFilters[2].operators.length, 2);
  assert.equal(actualFilters[2].type, 'integer');
});

test('it converts all the base type columns to the proper builder filters', function(assert) {
  let BuilderAdapterObject = EmberObject.extend(BuilderAdapterMixin);
  let subject = BuilderAdapterObject.create();
  let mockColumns = A();
  mockColumns.push(MockColumn.create({ name: 'foo', type: 'STRING' }));
  mockColumns.push(MockColumn.create({ name: 'bar', type: 'LONG' }));
  mockColumns.push(MockColumn.create({ name: 'baz', type: 'DOUBLE' }));
  mockColumns.push(MockColumn.create({ name: 'qux', type: 'BOOLEAN' }));
  let actualFilters = subject.builderFilters(mockColumns);

  assert.equal(actualFilters.length, 4);

  assert.equal(actualFilters[0].id, 'foo');
  assert.equal(actualFilters[0].operators.length, 13);
  assert.equal(actualFilters[0].type, 'string');

  assert.equal(actualFilters[1].id, 'bar');
  assert.equal(actualFilters[1].operators.length, 10);
  assert.equal(actualFilters[1].type, 'integer');

  assert.equal(actualFilters[2].id, 'baz');
  assert.equal(actualFilters[2].operators.length, 10);
  assert.equal(actualFilters[2].type, 'double');

  assert.equal(actualFilters[3].id, 'qux');
  assert.notOk(actualFilters[3].operators);
  assert.equal(actualFilters[3].type, 'boolean');
  assert.equal(actualFilters[3].input, 'radio');
  assert.ok(actualFilters[3].values);
});

test('it converts a freeform map type column to a simple filter and filters for subfields', function(assert) {
  let BuilderAdapterObject = EmberObject.extend(BuilderAdapterMixin);
  let subject = BuilderAdapterObject.create({ subfieldSuffix: '.*' });
  let mockColumn = MockColumn.create({ name: 'foo', type: 'MAP', subtype: 'STRING', hasFreeformField: true });

  let mockColumns = A([mockColumn]);

  let actualFilters = subject.builderFilters(mockColumns);

  assert.equal(actualFilters.length, 2);

  assert.equal(actualFilters[0].id, 'foo');
  assert.equal(actualFilters[0].operators.length, 2);
  assert.equal(actualFilters[0].type, 'integer');

  assert.equal(actualFilters[1].id, 'foo.*');
  assert.equal(actualFilters[1].operators.length, 13);
  assert.equal(actualFilters[1].type, 'string');
  assert.equal(actualFilters[1].show_subfield, true);
});

test('it converts an enumerated map type column to a simple filter and filters for subfields', function(assert) {
  let BuilderAdapterObject = EmberObject.extend(BuilderAdapterMixin);
  let subject = BuilderAdapterObject.create({ subfieldSuffix: '.*' });
  let mockColumn = MockColumn.create({ name: 'foo', type: 'MAP', subtype: 'DOUBLE' });
  mockColumn.addEnumeration('bar', '');
  mockColumn.addEnumeration('baz', '');

  let mockColumns = A([mockColumn]);

  let actualFilters = subject.builderFilters(mockColumns);

  assert.equal(actualFilters.length, 3);

  assert.equal(actualFilters[0].id, 'foo');
  assert.equal(actualFilters[0].operators.length, 2);
  assert.equal(actualFilters[0].type, 'integer');
  assert.notOk(actualFilters[0].show_subfield);

  assert.equal(actualFilters[1].id, 'foo.bar');
  assert.equal(actualFilters[1].operators.length, 10);
  assert.equal(actualFilters[1].type, 'double');
  assert.notOk(actualFilters[1].show_subfield);

  assert.equal(actualFilters[2].id, 'foo.baz');
  assert.equal(actualFilters[2].operators.length, 10);
  assert.equal(actualFilters[2].type, 'double');
  assert.notOk(actualFilters[2].show_subfield);
});

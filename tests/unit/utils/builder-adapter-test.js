/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { builderOptions, builderFilters } from 'bullet-ui/utils/builder-adapter';
import { module, test } from 'qunit';
import MockColumn from 'bullet-ui/tests/helpers/mocked-column';

module('Unit | Utility | builder adapter', function() {
  test('it sets default builder options with the right operators', function(assert) {
    assert.equal(builderOptions().operators.length, 13);
    assert.ok(builderOptions().sqlOperators.rlike);
  });

  test('it works fine if there are no columns', function(assert) {
    assert.ok(isEmpty(builderFilters()));
    assert.ok(isEmpty(builderFilters(null)));
    assert.ok(isEmpty(builderFilters(A())));
  });

  test('it converts unknown types to simple builder filters', function(assert) {
    let mockColumns = A();
    mockColumns.pushObject(new MockColumn({ name: 'foo', type: 'BIGINTEGER' }));
    mockColumns.pushObject(new MockColumn({ name: 'bar', type: 'LONG_MAP' }));
    mockColumns.pushObject(new MockColumn({ name: 'baz', type: 'FLOAT_LIST' }));
    let actualFilters = builderFilters(mockColumns);

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
    let mockColumns = A();
    mockColumns.pushObject(new MockColumn({ name: 'foo', type: 'STRING' }));
    mockColumns.pushObject(new MockColumn({ name: 'bar', type: 'LONG' }));
    mockColumns.pushObject(new MockColumn({ name: 'baz', type: 'DOUBLE' }));
    mockColumns.pushObject(new MockColumn({ name: 'qux', type: 'BOOLEAN' }));
    let actualFilters = builderFilters(mockColumns);

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

  test('it converts a freeform map type column to a simple filter and filters for subFields', function(assert) {
    let mockColumn = new MockColumn({ name: 'foo', type: 'STRING_MAP', isSubField: true });

    let mockColumns = A([mockColumn]);

    let actualFilters = builderFilters(mockColumns);

    assert.equal(actualFilters.length, 2);

    assert.equal(actualFilters[0].id, 'foo');
    assert.equal(actualFilters[0].operators.length, 2);
    assert.equal(actualFilters[0].type, 'integer');

    assert.equal(actualFilters[1].id, 'foo.*');
    assert.equal(actualFilters[1].operators.length, 13);
    assert.equal(actualFilters[1].type, 'string');
    assert.equal(actualFilters[1].show_subfield, true);
  });

  test('it converts an enumerated map type column to a simple filter and filters for subFields', function(assert) {
    let mockColumn = new MockColumn({ name: 'foo', type: 'DOUBLE_MAP' });
    mockColumn.addMapEnumeration('bar', '');
    mockColumn.addMapEnumeration('baz', '');

    let mockColumns = A([mockColumn]);

    let actualFilters = builderFilters(mockColumns);

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
});

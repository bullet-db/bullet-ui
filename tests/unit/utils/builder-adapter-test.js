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
    let actualFilters = builderFilters(A([new MockColumn({ name: 'foo', type: 'BIGINTEGER' })]));
    assert.equal(actualFilters.length, 1);
    assert.equal(actualFilters[0].id, 'foo');
    assert.equal(actualFilters[0].operators.length, 2);
    assert.equal(actualFilters[0].type, 'integer');
  });

  test('it converts all the base type columns to the proper builder filters', function(assert) {
    let mockColumns = A();
    mockColumns.pushObject(new MockColumn({ name: 'foo', type: 'STRING' }));
    mockColumns.pushObject(new MockColumn({ name: 'bar', type: 'LONG' }));
    mockColumns.pushObject(new MockColumn({ name: 'baz', type: 'DOUBLE' }));
    mockColumns.pushObject(new MockColumn({ name: 'qux', type: 'BOOLEAN' }));
    mockColumns.pushObject(new MockColumn({ name: 'quux', type: 'INTEGER' }));
    mockColumns.pushObject(new MockColumn({ name: 'norf', type: 'FLOAT' }));
    let actualFilters = builderFilters(mockColumns);

    assert.equal(actualFilters.length, 6);

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

    assert.equal(actualFilters[4].id, 'quux');
    assert.equal(actualFilters[4].operators.length, 10);
    assert.equal(actualFilters[4].type, 'integer');

    assert.equal(actualFilters[5].id, 'norf');
    assert.equal(actualFilters[5].operators.length, 10);
    assert.equal(actualFilters[5].type, 'double');
  });

  test('it converts a freeform map type column to a simple filter and filters for subFields', function(assert) {
    let mockColumn = new MockColumn({ name: 'foo', type: 'STRING_MAP' });

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

  test('it converts complex types into fully enumerated and flattened filters', function(assert) {
    let mockColumns = A();
    mockColumns.pushObject(new MockColumn({ name: 'foo', type: 'BIGINTEGER' }));
    mockColumns.pushObject(new MockColumn({ name: 'bar', type: 'LONG_MAP' }));
    mockColumns.pushObject(new MockColumn({ name: 'baz', type: 'FLOAT_LIST' }));

    let nestedMap = new MockColumn({ name: 'qux', type: 'DOUBLE_MAP_MAP' });
    nestedMap.addMapEnumeration('foo', '');
    nestedMap.addSubMapEnumeration('bar', '');
    mockColumns.pushObject(nestedMap);

    let nestedList = new MockColumn({ name: 'norf', type: 'STRING_MAP_LIST' });
    nestedList.addSubListEnumeration('baz', '');
    mockColumns.pushObject(nestedList);

    let actualFilters = builderFilters(mockColumns);

    assert.equal(actualFilters.length, 10);

    assert.equal(actualFilters[0].id, 'foo');
    assert.equal(actualFilters[0].operators.length, 2);
    assert.equal(actualFilters[0].type, 'integer');
    assert.notOk(actualFilters[0].show_subfield);

    assert.equal(actualFilters[1].id, 'bar');
    assert.equal(actualFilters[1].operators.length, 2);
    assert.equal(actualFilters[1].type, 'integer');
    assert.notOk(actualFilters[1].show_subfield);

    assert.equal(actualFilters[2].id, 'bar.*');
    assert.equal(actualFilters[2].operators.length, 10);
    assert.equal(actualFilters[2].type, 'integer');
    assert.equal(actualFilters[2].show_subfield, true);

    assert.equal(actualFilters[3].id, 'baz');
    assert.equal(actualFilters[3].operators.length, 2);
    assert.equal(actualFilters[3].type, 'integer');
    assert.notOk(actualFilters[3].show_subfield);

    assert.equal(actualFilters[4].id, 'qux');
    assert.equal(actualFilters[4].operators.length, 2);
    assert.equal(actualFilters[4].type, 'integer');
    assert.notOk(actualFilters[4].show_subfield);

    assert.equal(actualFilters[5].id, 'qux.*');
    assert.equal(actualFilters[5].operators.length, 2);
    assert.equal(actualFilters[5].type, 'integer');
    assert.equal(actualFilters[5].show_subfield, true);

    assert.equal(actualFilters[6].id, 'qux.foo');
    assert.equal(actualFilters[6].operators.length, 2);
    assert.equal(actualFilters[6].type, 'integer');
    assert.notOk(actualFilters[6].show_subfield);

    assert.equal(actualFilters[7].id, 'qux.foo.*');
    assert.equal(actualFilters[7].operators.length, 10);
    assert.equal(actualFilters[7].type, 'double');
    assert.equal(actualFilters[7].show_subfield, true);

    assert.equal(actualFilters[8].id, 'qux.foo.bar');
    assert.equal(actualFilters[8].operators.length, 10);
    assert.equal(actualFilters[8].type, 'double');
    assert.notOk(actualFilters[8].show_subfield);

    assert.equal(actualFilters[9].id, 'norf');
    assert.equal(actualFilters[9].operators.length, 2);
    assert.equal(actualFilters[9].type, 'integer');
    assert.notOk(actualFilters[9].show_subfield);
  });
});

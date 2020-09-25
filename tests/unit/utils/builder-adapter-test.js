/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { module, test } from 'qunit';
import {
  SUBFIELD_ENABLED_KEY, builderFilters, addQueryBuilderRules
} from 'bullet-ui/utils/builder-adapter';
import MockColumn from 'bullet-ui/tests/helpers/mocked-column';

module('Unit | Utility | builder adapter', function() {
  test('it works fine if there are no columns', function(assert) {
    assert.ok(isEmpty(builderFilters()));
    assert.ok(isEmpty(builderFilters(null)));
    assert.ok(isEmpty(builderFilters(A())));
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
    assert.equal(actualFilters[0].operators.length, 14);
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
    assert.equal(actualFilters[0].operators.length, 5);
    assert.equal(actualFilters[0].type, 'string');

    assert.equal(actualFilters[1].id, 'foo.*');
    assert.equal(actualFilters[1].operators.length, 14);
    assert.equal(actualFilters[1].type, 'string');
    assert.equal(actualFilters[1][SUBFIELD_ENABLED_KEY], true);
  });

  test('it converts complex types into fully enumerated and flattened filters', function(assert) {
    let mockColumns = A();
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

    assert.equal(actualFilters.length, 9);

    assert.equal(actualFilters[0].id, 'bar');
    assert.equal(actualFilters[0].operators.length, 5);
    assert.equal(actualFilters[0].type, 'string');
    assert.notOk(actualFilters[0][SUBFIELD_ENABLED_KEY]);

    assert.equal(actualFilters[1].id, 'bar.*');
    assert.equal(actualFilters[1].operators.length, 10);
    assert.equal(actualFilters[1].type, 'integer');
    assert.equal(actualFilters[1][SUBFIELD_ENABLED_KEY], true);

    assert.equal(actualFilters[2].id, 'baz');
    assert.equal(actualFilters[2].operators.length, 4);
    assert.equal(actualFilters[2].type, 'string');
    assert.notOk(actualFilters[2][SUBFIELD_ENABLED_KEY]);

    assert.equal(actualFilters[3].id, 'qux');
    assert.equal(actualFilters[3].operators.length, 5);
    assert.equal(actualFilters[3].type, 'string');
    assert.notOk(actualFilters[3][SUBFIELD_ENABLED_KEY]);

    assert.equal(actualFilters[4].id, 'qux.*');
    assert.equal(actualFilters[4].operators.length, 5);
    assert.equal(actualFilters[4].type, 'string');
    assert.equal(actualFilters[4][SUBFIELD_ENABLED_KEY], true);

    assert.equal(actualFilters[5].id, 'qux.foo');
    assert.equal(actualFilters[5].operators.length, 5);
    assert.equal(actualFilters[5].type, 'string');
    assert.notOk(actualFilters[5][SUBFIELD_ENABLED_KEY]);

    assert.equal(actualFilters[6].id, 'qux.foo.*');
    assert.equal(actualFilters[6].operators.length, 10);
    assert.equal(actualFilters[6].type, 'double');
    assert.equal(actualFilters[6][SUBFIELD_ENABLED_KEY], true);

    assert.equal(actualFilters[7].id, 'qux.foo.bar');
    assert.equal(actualFilters[7].operators.length, 10);
    assert.equal(actualFilters[7].type, 'double');
    assert.notOk(actualFilters[7][SUBFIELD_ENABLED_KEY]);

    assert.equal(actualFilters[8].id, 'norf');
    assert.equal(actualFilters[8].operators.length, 5);
    assert.equal(actualFilters[8].type, 'string');
    assert.notOk(actualFilters[8][SUBFIELD_ENABLED_KEY]);
  });

  test('it sets the provided rules to the querybuilder on the element first', function(assert) {
    assert.expect(2);
    let rules = [ { foo: 'bar' }, { bar: 1 }];
    let mockElement = {
      queryBuilder(name, args) {
        assert.equal(name, 'setRules');
        assert.deepEqual(args, rules);
      }
    };
    addQueryBuilderRules(mockElement, rules, undefined);
  });

  test('it preprocesses bql before setting it on the querybuilder', function(assert) {
    assert.expect(2);
    let bql = 'foo IN [1,2] AND bar = "5" OR foo NOT IN ["a", "b"] AND (baz RLIKE ANY [".+z", "?sx"] OR ' +
              'SIZEIS(qux, 25)) AND CONTAINSKEY(norf, "foo") AND CONTAINSKEY(norf, "bar") AND CONTAINSVALUE(quux, TRUE)'
    let sql = 'foo IN (1,2) AND bar = "5" OR foo NOT IN ("a", "b") AND (baz ANY (".+z", "?sx") OR ' +
              'qux REGEXP 25) AND norf LIKE "foo" AND norf LIKE "bar" AND quux ILIKE TRUE'
    let mockElement = {
      queryBuilder(name, string) {
        assert.equal(name, 'setRulesFromSQL');
        assert.equal(string, sql);
      }
    };
    addQueryBuilderRules(mockElement, undefined, bql);
  });

  test('it sets the empty set of rules if neither rules or bql is provided', function(assert) {
    assert.expect(2);
    let mockElement = {
      queryBuilder(name, args) {
        assert.equal(name, 'setRules');
        assert.deepEqual(args, { condition: 'AND', rules: [] });
      }
    };
    addQueryBuilderRules(mockElement, undefined, '');
  });
});

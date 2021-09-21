/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { isArray } from '@ember/array';
import { isEmpty, typeOf } from '@ember/utils';
import QueryConverter from 'bullet-ui/utils/query-converter';
import {
  AGGREGATION_TYPES, DISTRIBUTION_TYPES, DISTRIBUTION_POINT_TYPES, METRIC_TYPES, EMIT_TYPES, INCLUDE_TYPES
} from 'bullet-ui/utils/query-constants';
import MockQuery from 'bullet-ui/tests/helpers/mocked-query';

function arrayChecker(assert, emArray) {
  return (v, i) => assertEmberEqual(assert, emArray.objectAt(i), v);
}

function isEmptyObject(object) {
  return isEmpty(object) || Object.keys(object.data) === 0;
}

function assertEmberEqual(assert, emObject, object) {
  if (isEmpty(emObject) && !isEmpty(object)) {
    assert.ok(false, `Expected ${JSON.stringify(object)} but found empty: ${emObject}`);
    return;
  }
  for (let key in object) {
    let emValue = emObject.get(key);
    let value = object[key];
    let type = typeOf(value);

    if (type === 'string' || type === 'number' || type === 'boolean') {
      assert.equal(emValue, value);
    } else if (type === 'object') {
      let emType = typeOf(emValue);
      // Special case for filter.clause
      if (key === 'clause' && emType === 'object') {
        assert.deepEqual(emValue, value);
        return;
      }
      if (emType === 'object' && isEmptyObject(emValue)) {
        assert.ok(isEmpty(value), `Ember object: ${emValue} was empty but ${value} is not`);
      } else {
        assertEmberEqual(assert, emValue, value);
      }
    } else if (type === 'array') {
      if (!isArray(emValue)) {
        assert.ok(false, `Expected array ${JSON.stringify(value)} but found ${emValue}`);
        return;
      }
      value.forEach(arrayChecker(assert, emValue));
    } else {
      assert.ok(false, `Unknown type ${type}. Do not know how to check`);
    }
  }
}

module('Unit | Utility | query converter', function() {
  test('it does not recreate an empty query', function(assert) {
    assert.notOk(QueryConverter.recreateQuery(''));
  });

  test('it does not recreates a query if it is not understood', function(assert) {
    assert.notOk(QueryConverter.recreateQuery('foo'));
  });

  test('it recreates a query as a raw query if it is partially understood', function(assert) {
    assertEmberEqual(assert, QueryConverter.recreateQuery('select f FROM STREAM()'),
      {
        aggregation: { type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW) }
      }
    );
  });

  test('it recreates a raw query with no filters', function(assert) {
    assertEmberEqual(assert, QueryConverter.recreateQuery('SELECT * FROM STREAM(20000, TIME) LIMIT 1;'),
      {
        aggregation: { size: 1, type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW) },
        duration: 20000
      }
    );
  });


  test('it recreates projections correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT foo AS "goo", timestamp as ts FROM STREAM(1000, TIME) LIMIT 10'),
      {
        projections: [{ field: 'foo', name: 'goo' }, { field: 'timestamp', name: 'ts' }],
        aggregation: { size: 10, type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW) },
        duration: 1000
      }
    );
  });

  test('it recreates a filter correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery(
        'SELECT * FROM STREAM(0, TIME) ' +
        'WHERE complex_map_column.subfield1 != ALL [1,2,3] OR simple_column IN ["foo", "bar"]' +
        'LIMIT 1;'
      ),
      {
        filter: {
          summary: 'complex_map_column.subfield1 != ALL [1,2,3] OR simple_column IN ["foo", "bar"]'
        },
        aggregation: { size: 1, type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW) },
        duration: 0
      }
    );
  });

  test('it recreates a count distinct query without an alias correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT COUNT(DISTINCT foo) FROM STREAM(10000, TIME)'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT),
          groups: [{ field: 'foo' }]
        },
        duration: 10000
      }
    );
  });

  test('it recreates a count distinct query with an alias correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT COUNT(DISTINCT foo, bar) AS cnt FROM STREAM(10000, TIME)'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT),
          groups: [{ field: 'foo' }, { field: 'bar' }],
          newName: 'cnt'
        },
        duration: 10000
      }
    );
  });

  test('it recreates a distinct query without aliases correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT foo, bar FROM STREAM(10000, TIME) GROUP BY foo, bar'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP),
          groups: [{ field: 'foo' }, { field: 'bar' }]
        },
        duration: 10000
      }
    );
  });

  test('it recreates a distinct query with aliases correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT foo AS f, bar AS "b" FROM STREAM(10000, TIME) GROUP BY foo, bar'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP),
          groups: [{ field: 'foo', name: 'f' }, { field: 'bar', name: 'b' }]
        },
        duration: 10000
      }
    );
  });

  test('it recreates a group all query correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery(
        'SELECT COUNT(*) AS  cnt, SUM(baz) AS "sum", MAX(foo), AVG(bar), MIN(foo) FROM STREAM(10000, TIME)'
      ),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP),
          metrics: [
            { type: METRIC_TYPES.describe(METRIC_TYPES.COUNT), name: 'cnt' },
            { type: METRIC_TYPES.describe(METRIC_TYPES.SUM), field: 'baz', name: 'sum' },
            { type: METRIC_TYPES.describe(METRIC_TYPES.MAX), field: 'foo' },
            { type: METRIC_TYPES.describe(METRIC_TYPES.AVG), field: 'bar' },
            { type: METRIC_TYPES.describe(METRIC_TYPES.MIN), field: 'foo' }
          ]
        },
        duration: 10000
      }
    );
  });

  test('it recreates a group by query correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery(
        'SELECT foo AS "foo", complex_map_column.foo AS bar, COUNT(*) , SUM(baz) AS "sum", MIN(foo) as foo ' +
        'FROM STREAM(10000, TIME) ' +
        'GROUP BY foo, complex_map_column.foo'
      ),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP),
          groups: [{ field: 'foo', name: 'foo' }, { field: 'complex_map_column.foo', name: 'bar' }],
          metrics: [
            { type: METRIC_TYPES.describe(METRIC_TYPES.COUNT) },
            { type: METRIC_TYPES.describe(METRIC_TYPES.SUM), field: 'baz', name: 'sum' },
            { type: METRIC_TYPES.describe(METRIC_TYPES.MIN), field: 'foo' }
          ]
        },
        duration: 10000
      }
    );
  });

  test('it ignores malformed group by queries correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery(
        'SELECT * ' +
        'FROM STREAM(10000, TIME) ' +
        'GROUP BY foo, complex_map_column.foo'
      ),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP),
          groups: [{ field: 'foo' }, { field: 'complex_map_column.foo' }],
        },
        duration: 10000
      }
    );
  });


  test('it recreates a quantile distribution with number of points', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT QUANTILE(foo, LINEAR, 15) FROM STREAM(10000, TIME)'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION),
          groups: [{ field: 'foo' }],
          distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
          pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER),
          numberOfPoints: 15
        },
        duration: 10000
      }
    );
  });

  test('it recreates a frequency distribution with number of points', function(assert) {
    assertEmberEqual(assert,
      QueryConverter.recreateQuery('SELECT FREQ(foo, LINEAR, 15) FROM STREAM(10000, TIME)'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION),
          groups: [{ field: 'foo' }],
          distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.FREQ),
          pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER),
          numberOfPoints: 15
        },
        duration: 10000
      }
    );
  });

  test('it recreates a cumulative frequency distribution with number of points', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT CUMFREQ(foo, LINEAR, 15) FROM STREAM(10000, TIME)'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION),
          groups: [{ field: 'foo' }],
          distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.CUMFREQ),
          pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER),
          numberOfPoints: 15
        },
        duration: 10000
      }
    );
  });

  test('it recreates a distribution with generated points', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT QUANTILE(foo, REGION, 0.4, 0.6, 0.01) FROM STREAM(10000, TIME)'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION),
          groups: [{ field: 'foo' }],
          distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
          pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.GENERATED),
          start: 0.4, end: 0.6, increment: 0.01
        },
        duration: 10000
      }
    );
  });

  test('it recreates a distribution with free-form points', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery(
        'SELECT QUANTILE(foo, MANUAL, 0.5, 0.2, 0.75, 0.99) FROM STREAM(10000, TIME) LIMIT 10;'
      ),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION),
          groups: [{ field: 'foo' }],
          distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
          pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.POINTS),
          points: '0.5,0.2,0.75,0.99'
        },
        duration: 10000
      }
    );
  });

  test('it recreates a top k query correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT TOP(500, foo) FROM STREAM(10000, TIME)'),
      {
        aggregation: {
          size: 500,
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K),
          groups: [{ field: 'foo' }]
        },
        duration: 10000
      }
    );
  });

  test('it recreates a top k query with threshold and new name correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT TOP(500, 150, foo) AS "bar", foo AS foo FROM STREAM(10000, TIME)'),
      {
        aggregation: {
          size: 500,
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K),
          groups: [{ field: 'foo', name: 'foo' }],
          newName: 'bar',
          threshold: 150
        },
        duration: 10000
      }
    );
  });

  test('it recreates a time window correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT * FROM STREAM(10000, TIME) WINDOWING EVERY(5000, TIME) LIMIT 10'),
      {
        aggregation: {
          size: 10,
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW),
        },
        duration: 10000,
        window: {
          emitType: EMIT_TYPES.describe(EMIT_TYPES.TIME),
          emitEvery: 5000,
          includeType: INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW)
        }
      }
    );
  });

  test('it recreates a record window correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT * FROM STREAM(1000, TIME) WINDOWING TUMBLING(5, RECORD)'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW),
        },
        duration: 1000,
        window: {
          emitType: EMIT_TYPES.describe(EMIT_TYPES.RECORD),
          emitEvery: 5,
          includeType: INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW)
        }
      }
    );
  });

  test('it recreates a include all window correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT * FROM STREAM(10000, TIME) WINDOWING EVERY(1000, TIME, ALL)'),
      {
        aggregation: {
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW),
        },
        duration: 10000,
        window: {
          emitType: EMIT_TYPES.describe(EMIT_TYPES.TIME),
          emitEvery: 1000,
          includeType: INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL)
        }
      }
    );
  });

  test('it ignores a malformed window correctly', function(assert) {
    assertEmberEqual(
      assert,
      QueryConverter.recreateQuery('SELECT * FROM STREAM(10000, TIME) WINDOWING WHAT(5000, TIME) LIMIT 10'),
      {
        aggregation: {
          size: 10,
          type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW),
        },
        duration: 10000
      }
    );
  });


  test('it creates bql for a base query correctly', function(assert) {
    let query = MockQuery.create({ name: 'baz', foo: 'bar' });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(0, TIME) LIMIT 1 ');
  });

  test('it creates bql for duration correctly', function(assert) {
    let query = MockQuery.create({ duration: 20000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(20000, TIME) LIMIT 1 ');
  });

  test('it creates bql for projections correctly', function(assert) {
    let query = MockQuery.create({ duration: 1000, created: new Date(Date.now()) });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addProjection('foo', 'goo');
    query.addProjection('timestamp', 'ts');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT foo AS "goo", timestamp AS "ts" FROM STREAM(1000, TIME) LIMIT 10 '
    );
  });

  test('it creates bql for no filters', function(assert) {
    let query = MockQuery.create({ foo: 'bar' });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    query.set('filter', undefined);
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(0, TIME) LIMIT 1 ');
  });

  test('it creates bql for a query correctly with a name', function(assert) {
    let query = MockQuery.create({ name: 'foo' });
    let filter = { condition: 'OR', rules: [] };
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    query.addFilter(filter, 'foo');
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(0, TIME) WHERE foo LIMIT 1 ');
  });

  test('it creates bql for a filter correctly with a summary', function(assert) {
    let query = MockQuery.create();
    let filter = { condition: 'OR', rules: [] };
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    query.addFilter(filter, 'complex_map_column.subfield1 != ALL ["1", "2", "3"] OR simple_column = ANY ["foo", "bar"]');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT * FROM STREAM(0, TIME) ' +
      'WHERE complex_map_column.subfield1 != ALL ["1", "2", "3"] OR simple_column = ANY ["foo", "bar"] LIMIT 1 '
    );
  });

  test('it creates bql for a count distinct query with a new name query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT), 100, { newName: 'cnt' });
    query.addGroup('foo', '1');
    query.addGroup('bar', '2');
    assert.equal(QueryConverter.createBQL(query), 'SELECT COUNT(DISTINCT foo, bar) AS "cnt" FROM STREAM(10000, TIME) ');
  });

  test('it creates bql for a count distinct query without a new name query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT), 100);
    query.addGroup('foo', '1');
    assert.equal(QueryConverter.createBQL(query), 'SELECT COUNT(DISTINCT foo) FROM STREAM(10000, TIME) ');
  });

  test('it creates bql for a distinct query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP), 500);
    query.addGroup('foo', '1');
    query.addGroup('bar', '2');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT foo AS "1", bar AS "2" FROM STREAM(10000, TIME) GROUP BY foo, bar LIMIT 500 '
    );
  });

  test('it creates bql for a group all query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP), 500);
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.COUNT), null, 'cnt');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.SUM), 'baz', 'sum');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.MAX), 'foo');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.AVG), 'bar');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.MIN), 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT COUNT(*) AS "cnt", SUM(baz) AS "sum", MAX(foo), AVG(bar), MIN(foo) FROM STREAM(10000, TIME) LIMIT 500 '
    );
  });

  test('it creates bql for a group by query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP), 500);
    query.addGroup('foo', 'foo');
    query.addGroup('complex_map_column.foo', 'bar');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.COUNT));
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.SUM), 'baz', 'sum');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.MIN), 'foo');

    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT foo AS "foo", complex_map_column.foo AS "bar", COUNT(*), SUM(baz) AS "sum", MIN(foo) ' +
      'FROM STREAM(10000, TIME) GROUP BY foo, complex_map_column.foo LIMIT 500 '
    );
  });

  test('it creates bql for a quantile distribution with number of points', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      numberOfPoints: 15,
      distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT QUANTILE(foo, LINEAR, 15) FROM STREAM(10000, TIME) LIMIT 500 '
    );
  });

  test('it creates bql for a frequency distribution with number of points', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      numberOfPoints: 15,
      distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.FREQ),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT FREQ(foo, LINEAR, 15) FROM STREAM(10000, TIME) LIMIT 500 '
    );
  });

  test('it creates bql for a cumulative frequency distribution with number of points', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      numberOfPoints: 15,
      distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.CUMFREQ),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT CUMFREQ(foo, LINEAR, 15) FROM STREAM(10000, TIME) LIMIT 500 '
    );
  });

  test('it creates bql for a distribution with generated points', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      start: 0.4,
      end: 0.6,
      increment: 0.01,
      distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.GENERATED)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT QUANTILE(foo, REGION, 0.4, 0.6, 0.01) FROM STREAM(10000, TIME) LIMIT 500 '
    );
  });

  test('it creates bql for a distribution with free-form points', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      points: '0.5,0.2, 0.75,0.99',
      distributionType: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.POINTS)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT QUANTILE(foo, MANUAL, 0.5, 0.2, 0.75, 0.99) FROM STREAM(10000, TIME) LIMIT 500 '
    );
  });

  test('it creates bql for a top k query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K), 500);
    query.addGroup('foo', 'foo');
    assert.equal(QueryConverter.createBQL(query), 'SELECT TOP(500, foo), foo AS "foo" FROM STREAM(10000, TIME) ');
  });

  test('it creates bql for a top k query with threshold and new name correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K), 500, {
      newName: 'bar',
      threshold: 150
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT TOP(500, 150, foo) AS "bar", foo AS "foo" FROM STREAM(10000, TIME) '
    );
  });

  test('it creates bql for an empty window object correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addWindow();
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(10000, TIME) LIMIT 10 ');
  });

  test('it creates bql for a time window correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addWindow(EMIT_TYPES.describe(EMIT_TYPES.TIME), 2000, null);
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT * FROM STREAM(10000, TIME) WINDOWING TUMBLING(2000, TIME) LIMIT 10 '
    );
  });

  test('it creates bql for a record window correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addWindow(EMIT_TYPES.describe(EMIT_TYPES.RECORD), 1, null);
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT * FROM STREAM(10000, TIME) WINDOWING TUMBLING(1, RECORD) LIMIT 10 '
    );
  });

  test('it creates bql for a include all window correctly', function(assert) {
    let query = MockQuery.create({ duration: 10000 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addWindow(EMIT_TYPES.describe(EMIT_TYPES.TIME), 2000, INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL));
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT * FROM STREAM(10000, TIME) WINDOWING EVERY(2000, TIME, ALL) LIMIT 10 '
    );
  });

  test('it matches bql for a simple query correctly', function(assert) {
    let query = 'SELECT * FROM STREAM(10000, TIME) WINDOWING EVERY(2000, TIME, ALL) LIMIT 10';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('duration'), 10000);
    assert.equal(categorization.get('emitType'), EMIT_TYPES.TIME);
    assert.equal(categorization.get('emitEvery'), 2000);
  });

  test('it matches bql for a count distinct query', function(assert) {
    let query = 'SELECT COUNT(DISTINCT foo) FROM (SELECT * FROM STREAM(10000, TIME) WINDOWING EVERY(2000, TIME, ALL) LIMIT 10)';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.COUNT_DISTINCT);
    assert.equal(categorization.get('isStarSelect'), false);
    assert.equal(categorization.get('isGroupAll'), false);
    assert.equal(categorization.get('duration'), 10000);
    assert.equal(categorization.get('emitType'), EMIT_TYPES.TIME);
    assert.equal(categorization.get('emitEvery'), 2000);
  });

  test('it matches bql for a nested raw query', function(assert) {
    let query = 'SELECT abc FROM (SELECT def FROM STREAM(10000, TIME))';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.RAW);
    assert.equal(categorization.get('isStarSelect'), false);
    assert.equal(categorization.get('isGroupAll'), false);
    assert.equal(categorization.get('duration'), 10000);
    assert.equal(categorization.get('emitType'), undefined);
    assert.equal(categorization.get('emitEvery'), undefined);
  });

  test('it matches bql for a nested group by query', function(assert) {
    let query = 'SELECT * FROM (SELECT SUM(def) FROM STREAM(20000, TIME) GROUP BY def)';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.GROUP);
    assert.equal(categorization.get('isStarSelect'), false);
    assert.equal(categorization.get('isGroupAll'), false);
    assert.equal(categorization.get('duration'), 20000);
  });

  test('it matches bql for another nested group by query', function(assert) {
    let query = 'SELECT abc FROM (SELECT SUM(def) FROM STREAM(20000, TIME) GROUP BY def) GROUP BY abc';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.GROUP);
    assert.equal(categorization.get('isStarSelect'), false);
    assert.equal(categorization.get('isGroupAll'), false);
    assert.equal(categorization.get('duration'), 20000);
  });

  test('it matches bql for one more nested group by query', function(assert) {
    let query = 'SELECT abc FROM (SELECT SUM(def) FROM STREAM(20000, TIME) ORDER BY def) GROUP BY abc';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.GROUP);
    assert.equal(categorization.get('isStarSelect'), false);
    assert.equal(categorization.get('isGroupAll'), false);
    assert.equal(categorization.get('duration'), 20000);
  });

  test('it matches bql for a nested group all query', function(assert) {
    let query = 'SELECT * FROM (SELECT SUM(def) FROM STREAM(20000, TIME))';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.GROUP);
    assert.equal(categorization.get('isStarSelect'), false);
    assert.equal(categorization.get('isGroupAll'), true);
    assert.equal(categorization.get('duration'), 20000);
  });

  test('it matches bql for another nested group all query', function(assert) {
    let query = 'SELECT SUM(def) FROM (SELECT * FROM STREAM(20000, TIME))';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.GROUP);
    assert.equal(categorization.get('isStarSelect'), false);
    assert.equal(categorization.get('isGroupAll'), true);
    assert.equal(categorization.get('duration'), 20000);
  });

  test('it matches bql for a nested select star query', function(assert) {
    let query = 'SELECT * FROM (SELECT abc FROM STREAM(20000, TIME))';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.RAW);
    assert.equal(categorization.get('isStarSelect'), true);
    assert.equal(categorization.get('isGroupAll'), false);
    assert.equal(categorization.get('duration'), 20000);
  });

  test('it matches bql for another nested select star query', function(assert) {
    let query = 'SELECT * FROM (SELECT * FROM STREAM(20000, TIME))';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.RAW);
    assert.equal(categorization.get('isStarSelect'), true);
    assert.equal(categorization.get('isGroupAll'), false);
    assert.equal(categorization.get('duration'), 20000);
  });

  test('not a nested select star query if star is only in the inner query', function(assert) {
    let query = 'SELECT abc FROM (SELECT * FROM STREAM(20000, TIME))';
    let categorization = QueryConverter.categorizeBQL(query);
    assert.equal(categorization.get('type'), AGGREGATION_TYPES.RAW);
    assert.equal(categorization.get('isStarSelect'), false);
    assert.equal(categorization.get('isGroupAll'), false);
    assert.equal(categorization.get('duration'), 20000);
  });
});

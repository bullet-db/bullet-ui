/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import QueryConverter from 'bullet-ui/utils/query-converter';
import {
  AGGREGATION_TYPES, DISTRIBUTION_TYPES, DISTRIBUTION_POINT_TYPES, METRIC_TYPES, EMIT_TYPES, INCLUDE_TYPES
} from 'bullet-ui/utils/query-constants';
import MockQuery from 'bullet-ui/tests/helpers/mocked-query';

module('Unit | Utility | query converter', function() {
  test('it creates bql for a base query correctly', function(assert) {
    let query = MockQuery.create({ name: 'baz', foo: 'bar' });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(0, TIME) LIMIT 1 ;');
  });

  test('it creates bql for duration correctly', function(assert) {
    let query = MockQuery.create({ duration: 20 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(20000, TIME) LIMIT 1 ;');
  });

  test('it creates bql for projections correctly', function(assert) {
    let query = MockQuery.create({ duration: 1, created: new Date(Date.now()) });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addProjection('foo', 'goo');
    query.addProjection('timestamp', 'ts');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT foo AS "goo", timestamp AS "ts" FROM STREAM(1000, TIME) LIMIT 10 ;'
    );
  });

  test('it creates bql for no filters', function(assert) {
    let query = MockQuery.create({ foo: 'bar' });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    query.set('filter', undefined);
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(0, TIME) LIMIT 1 ;');
  });

  test('it creates bql for a query correctly with a name', function(assert) {
    let query = MockQuery.create({ name: 'foo' });
    let filter = { condition: 'OR', rules: [] };
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    query.addFilter(filter, 'foo');
    assert.equal(QueryConverter.createBQL(query), 'SELECT * FROM STREAM(0, TIME) WHERE foo LIMIT 1 ;');
  });

  test('it creates bql for a filter correctly with a summary', function(assert) {
    let query = MockQuery.create();
    let filter = { condition: 'OR', rules: [] };
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW));
    query.addFilter(filter, 'complex_map_column.subfield1 != ALL ["1", "2", "3"] OR simple_column = ANY ["foo", "bar"]');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT * FROM STREAM(0, TIME) ' +
      'WHERE complex_map_column.subfield1 != ALL ["1", "2", "3"] OR simple_column = ANY ["foo", "bar"] LIMIT 1 ;'
    );
  });

  test('it creates bql for a count distinct query with a new name query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT), 100, { newName: 'cnt' });
    query.addGroup('foo', '1');
    query.addGroup('bar', '2');
    assert.equal(QueryConverter.createBQL(query), 'SELECT COUNT(DISTINCT foo, bar) AS "cnt" FROM STREAM(10000, TIME) ;');
  });

  test('it creates bql for a count distinct query without a new name query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT), 100);
    query.addGroup('foo', '1');
    assert.equal(QueryConverter.createBQL(query), 'SELECT COUNT(DISTINCT foo) FROM STREAM(10000, TIME) ;');
  });

  test('it creates bql for a distinct query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP), 500);
    query.addGroup('foo', '1');
    query.addGroup('bar', '2');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT foo AS "1", bar AS "2" FROM STREAM(10000, TIME) GROUP BY foo, bar LIMIT 500 ;'
    );
  });

  test('it creates bql for a group all query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP), 500);
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.COUNT), null, 'cnt');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.SUM), 'baz', 'sum');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.MAX), 'foo');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.AVG), 'bar');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.MIN), 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT COUNT(*) AS "cnt", SUM(baz) AS "sum", MAX(foo), AVG(bar), MIN(foo) FROM STREAM(10000, TIME) LIMIT 500 ;'
    );
  });

  test('it creates bql for a group by query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP), 500);
    query.addGroup('foo', 'foo');
    query.addGroup('complex_map_column.foo', 'bar');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.COUNT));
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.SUM), 'baz', 'sum');
    query.addMetric(METRIC_TYPES.describe(METRIC_TYPES.MIN), 'foo');

    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT foo AS "foo", complex_map_column.foo AS "bar", COUNT(*), SUM(baz) AS "sum", MIN(foo) ' +
      'FROM STREAM(10000, TIME) GROUP BY foo, complex_map_column.foo LIMIT 500 ;'
    );
  });

  test('it creates bql for a quantile distribution with number of points', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      numberOfPoints: 15,
      type: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT QUANTILE(foo, LINEAR, 15) FROM STREAM(10000, TIME) LIMIT 500 ;'
    );
  });

  test('it creates bql for a frequency distribution with number of points', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      numberOfPoints: 15,
      type: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.FREQ),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT FREQ(foo, LINEAR, 15) FROM STREAM(10000, TIME) LIMIT 500 ;'
    );
  });

  test('it creates bql for a cumulative frequency distribution with number of points', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      numberOfPoints: 15,
      type: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.CUMFREQ),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT CUMFREQ(foo, LINEAR, 15) FROM STREAM(10000, TIME) LIMIT 500 ;'
    );
  });

  test('it creates bql for a distribution with generated points', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      start: 0.4,
      end: 0.6,
      increment: 0.01,
      type: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.GENERATED)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT QUANTILE(foo, REGION, 0.4, 0.6, 0.01) FROM STREAM(10000, TIME) LIMIT 500 ;'
    );
  });

  test('it creates bql for a distribution with free-form points', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 500, {
      points: '0.5,0.2, 0.75,0.99',
      type: DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE),
      pointType: DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.POINTS)
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT QUANTILE(foo, MANUAL, 0.5, 0.2, 0.75, 0.99) FROM STREAM(10000, TIME) LIMIT 500 ;'
    );
  });

  test('it creates bql for a top k query correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K), 500);
    query.addGroup('foo', 'foo');
    assert.equal(QueryConverter.createBQL(query), 'SELECT TOP(500, foo), foo AS "foo" FROM STREAM(10000, TIME) ;');
  });

  test('it creates bql for a top k query with threshold and new name correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K), 500, {
      newName: 'bar',
      threshold: 150
    });
    query.addGroup('foo', 'foo');
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT TOP(500, 150, foo) AS "bar", foo AS "foo" FROM STREAM(10000, TIME) ;'
    );
  });

  test('it creates bql for a time window correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addWindow(EMIT_TYPES.describe(EMIT_TYPES.TIME), 2, null);
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT * FROM STREAM(10000, TIME) WINDOWING TUMBLING(2000, TIME) LIMIT 10 ;'
    );
  });

  test('it creates bql for a record window correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addWindow(EMIT_TYPES.describe(EMIT_TYPES.RECORD), 1, null);
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT * FROM STREAM(10000, TIME) WINDOWING TUMBLING(1, RECORD) LIMIT 10 ;'
    );
  });

  test('it creates bql for a include all window correctly', function(assert) {
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW), 10);
    query.addWindow(EMIT_TYPES.describe(EMIT_TYPES.TIME), 2, INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL));
    assert.equal(
      QueryConverter.createBQL(query),
      'SELECT * FROM STREAM(10000, TIME) WINDOWING EVERY(2000, TIME, ALL) LIMIT 10 ;'
    );
  });
});

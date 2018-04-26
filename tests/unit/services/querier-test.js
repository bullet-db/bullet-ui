/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isArray } from '@ember/array';
import $ from 'jquery';
import { isEmpty, typeOf } from '@ember/utils';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import MockQuery from '../../helpers/mocked-query';
import FILTERS from '../../fixtures/filters';
import { AGGREGATIONS, DISTRIBUTIONS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';

module('Unit | Service | querier', function(hooks) {
  setupTest(hooks);

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
          assert.ok($.isEmptyObject(value), `Ember object: ${emValue} was empty but ${value} is not`);
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

  test('it turns on', function(assert) {
    let service = this.owner.lookup('service:querier');
    assert.ok(service);
  });

  test('it formats a defaulted query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ name: 'baz', foo: 'bar' });
    query.set('aggregation', null);
    assert.deepEqual(service.reformat(query), { duration: 0 });
  });

  test('it formats an raw aggregation correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 20 });
    query.set('aggregation', null);
    assert.deepEqual(service.reformat(query), {
      duration: 20000
    });
    query.addAggregation(AGGREGATIONS.get('RAW'));
    assert.deepEqual(service.reformat(query), {
      aggregation: { size: 1, type: 'RAW' },
      duration: 20000
    });
  });

  test('it formats projections correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 1, created: new Date(Date.now()) });
    query.addAggregation(AGGREGATIONS.get('RAW'), 10);
    query.addProjection('foo', 'goo');
    query.addProjection('timestamp', 'ts');
    assert.deepEqual(service.reformat(query), {
      aggregation: { size: 10, type: 'RAW' },
      projection: { fields: { foo: 'goo', timestamp: 'ts' } },
      duration: 1000
    });
  });

  test('it ignores a removed filter', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ foo: 'bar' });
    query.addAggregation(AGGREGATIONS.get('RAW'));
    query.set('filter', undefined);
    assert.deepEqual(service.reformat(query), { aggregation: { size: 1, type: 'RAW' }, duration: 0 });
  });

  test('it formats a query correctly with a name', function(assert) {
    let service = this.owner.factoryFor('service:querier').create({ apiMode: false });
    let query = MockQuery.create({ name: 'foo' });
    let filter = { condition: 'OR', rules: [] };
    query.addAggregation(AGGREGATIONS.get('RAW'));
    query.addFilter(filter, 'foo');
    assert.deepEqual(service.reformat(query), {
      name: 'foo',
      filterSummary: 'foo',
      aggregation: { size: 1, type: 'RAW' },
      duration: 0
    });
  });

  test('it formats a filter correctly with a summary', function(assert) {
    let service = this.owner.factoryFor('service:querier').create({ apiMode: false });
    let query = MockQuery.create();
    let filter = { condition: 'OR', rules: [] };
    query.addAggregation(AGGREGATIONS.get('RAW'));
    query.addFilter(filter, 'foo');
    assert.deepEqual(service.reformat(query), {
      filterSummary: 'foo',
      aggregation: { size: 1, type: 'RAW' },
      duration: 0
    });
  });

  test('it formats a filter correctly without a summary in apiMode', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create();
    let filter = {
      condition: 'OR',
      rules: [
        { field: 'complex_map_column.*', subfield: 'subfield1', operator: 'not_in', value: '1,2,3' },
        { field: 'simple_column', subfield: null, operator: 'in', value: 'foo,bar' }
      ]
    };
    query.addAggregation(AGGREGATIONS.get('RAW'));
    query.addFilter(filter, 'foo');
    assert.deepEqual(service.reformat(query), {
      filters: [FILTERS.OR_FREEFORM],
      aggregation: { size: 1, type: 'RAW' },
      duration: 0
    });
  });

  test('it unwraps a filter if it is the only one at the top level', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create();
    let filter = {
      condition: 'AND',
      rules: [
        { field: 'foo', operator: 'is_null' }
      ]
    };
    query.addAggregation(AGGREGATIONS.get('RAW'));
    query.addFilter(filter, 'foo');
    assert.deepEqual(service.reformat(query), {
      filters: [{ field: 'foo', operation: '==', values: ['NULL'] }],
      aggregation: { size: 1, type: 'RAW' },
      duration: 0
    });
  });

  test('it formats a count distinct query with a new name query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('COUNT_DISTINCT'), 100, { newName: 'cnt' });
    query.addGroup('foo', '1');
    query.addGroup('bar', '2');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 100,
        type: 'COUNT DISTINCT',
        fields: { foo: '1', bar: '2' },
        attributes: { newName: 'cnt' }
      },
      duration: 10000
    });
  });

  test('it formats a count distinct query without a new name query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('COUNT_DISTINCT'), 100);
    query.addGroup('foo', '1');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 100,
        type: 'COUNT DISTINCT',
        fields: { foo: '1' }
      },
      duration: 10000
    });
  });

  test('it formats a distinct query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('GROUP'), 500);
    query.addGroup('foo', '1');
    query.addGroup('bar', '2');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'GROUP',
        fields: { foo: '1', bar: '2' }
      },
      duration: 10000
    });
  });

  test('it formats a group all query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('GROUP'), 500);
    query.addMetric(METRICS.get('COUNT'), null, 'cnt');
    query.addMetric(METRICS.get('SUM'), 'baz', 'sum');
    query.addMetric(METRICS.get('MAX'), 'foo');
    query.addMetric(METRICS.get('AVG'), 'bar');
    query.addMetric(METRICS.get('MIN'), 'foo');

    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'GROUP',
        attributes: {
          operations: [
            { type: 'COUNT', newName: 'cnt' },
            { type: 'SUM', field: 'baz', newName: 'sum' },
            { type: 'MAX', field: 'foo' },
            { type: 'AVG', field: 'bar' },
            { type: 'MIN', field: 'foo' }
          ]
        }
      },
      duration: 10000
    });
  });

  test('it formats a group by query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('GROUP'), 500);
    query.addGroup('foo', 'foo');
    query.addGroup('complex_map_column.foo', 'bar');
    query.addMetric(METRICS.get('COUNT'));
    query.addMetric(METRICS.get('SUM'), 'baz', 'sum');
    query.addMetric(METRICS.get('MIN'), 'foo');

    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'GROUP',
        fields: { foo: 'foo', 'complex_map_column.foo': 'bar' },
        attributes: {
          operations: [
            { type: 'COUNT' },
            { type: 'SUM', field: 'baz', newName: 'sum' },
            { type: 'MIN', field: 'foo' }
          ]
        }
      },
      duration: 10000
    });
  });

  test('it formats a quantile distribution with number of points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('DISTRIBUTION'), 500, {
      numberOfPoints: 15,
      type: DISTRIBUTIONS.get('QUANTILE')
    });
    query.addGroup('foo', 'foo');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'QUANTILE', numberOfPoints: 15 }
      },
      duration: 10000
    });
  });

  test('it formats a frequency distribution with number of points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('DISTRIBUTION'), 500, {
      numberOfPoints: 15,
      type: DISTRIBUTIONS.get('PMF')
    });
    query.addGroup('foo', 'foo');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'PMF', numberOfPoints: 15 }
      },
      duration: 10000
    });
  });

  test('it formats a cumulative frequency distribution with number of points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('DISTRIBUTION'), 500, {
      numberOfPoints: 15,
      type: DISTRIBUTIONS.get('CDF')
    });
    query.addGroup('foo', 'foo');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'CDF', numberOfPoints: 15 }
      },
      duration: 10000
    });
  });

  test('it formats a distribution with generated points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('DISTRIBUTION'), 500, {
      start: 0.4,
      end: 0.6,
      increment: 0.01,
      type: DISTRIBUTIONS.get('QUANTILE')
    });
    query.addGroup('foo', 'foo');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'QUANTILE', start: 0.4, end: 0.6, increment: 0.01 }
      },
      duration: 10000
    });
  });

  test('it formats a distribution with free-form points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('DISTRIBUTION'), 500, {
      points: '0.5,0.2, 0.75,0.99',
      type: DISTRIBUTIONS.get('QUANTILE')
    });
    query.addGroup('foo', 'foo');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'QUANTILE', points: [0.5, 0.2, 0.75, 0.99] }
      },
      duration: 10000
    });
  });

  test('it formats a top k query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('TOP_K'), 500);
    query.addGroup('foo', 'foo');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'TOP K',
        fields: { foo: 'foo' }
      },
      duration: 10000
    });
  });

  test('it formats a top k query with threshold and new name correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = MockQuery.create({ duration: 10 });
    query.addAggregation(AGGREGATIONS.get('TOP_K'), 500, {
      newName: 'bar',
      threshold: 150
    });
    query.addGroup('foo', 'foo');
    assert.deepEqual(service.reformat(query), {
      aggregation: {
        size: 500,
        type: 'TOP K',
        fields: { foo: 'foo' },
        attributes: { newName: 'bar', threshold: 150 }
      },
      duration: 10000
    });
  });

  test('it recreates a query with a name not created in api mode correctly', function(assert) {
    let service = this.owner.factoryFor('service:querier').create({ apiMode: false });
    let query = {
      name: 'foo',
      aggregation: { size: 1, type: 'RAW' },
      duration: 20000
    };

    assertEmberEqual(assert, service.recreate(query), {
      name: 'foo',
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: { size: 1, type: 'Raw', attributes: { } },
      duration: 20
    });
  });

  test('it recreates a raw query with no filters', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: { size: 1, type: 'RAW' },
      duration: 20000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: { size: 1, type: 'Raw', attributes: { } },
      duration: 20
    });
  });

  test('it recreates a query with no aggregations even though that should not be possible', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: null,
      duration: 20000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      duration: 20
    });
  });


  test('it recreates projections correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: { size: 10, type: 'RAW' },
      projection: { fields: { foo: 'goo', timestamp: 'ts' } },
      duration: 1000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      projections: [{ field: 'foo', name: 'goo' }, { field: 'timestamp', name: 'ts' }],
      aggregation: { size: 10, type: 'Raw', attributes: { } },
      duration: 1
    });
  });

  test('it recreates a filter correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      filters: [FILTERS.OR_FREEFORM],
      aggregation: { size: 1, type: 'RAW' },
      duration: 0
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: {
        clause: {
          condition: 'OR',
          rules: [
            { id: 'complex_map_column.subfield1', field: 'complex_map_column.subfield1', operator: 'not_in', value: '1,2,3' },
            { id: 'simple_column', field: 'simple_column', operator: 'in', value: 'foo,bar' }
          ]
        }
      },
      aggregation: { size: 1, type: 'Raw', attributes: { } },
      duration: 0
    });
  });

  test('it recreates a filter not created in api mode correctly', function(assert) {
    let service = this.owner.factoryFor('service:querier').create({ apiMode: false });
    let query = {
      filters: [{
        operation: 'OR',
        clauses: [
          {
            operation: '!=',
            field: 'complex_map_column.subfield1',
            subfield: true,
            values: ['1', '2', '3']
          },
          {
            operation: '==',
            field: 'simple_column',
            values: ['foo', 'bar']
          }
        ]
      }],
      aggregation: { size: 1, type: 'RAW', attributes: { } },
      duration: 0
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: {
        clause: {
          condition: 'OR',
          rules: [
            { id: 'complex_map_column.*', field: 'complex_map_column.*', subfield: 'subfield1', operator: 'not_in', value: '1,2,3' },
            { id: 'simple_column', field: 'simple_column', operator: 'in', value: 'foo,bar' }
          ]
        }
      },
      aggregation: { size: 1, type: 'Raw', attributes: { } },
      duration: 0
    });
  });

  test('it recreates and nests a simple filter if it is the only one at the top level', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      filters: [{ field: 'foo', operation: '!=', values: ['1'] }],
      aggregation: { size: 1, type: 'RAW' },
      duration: 0
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: {
        clause: {
          condition: 'AND',
          rules: [{ id: 'foo', field: 'foo', operator: 'not_equal', value: '1' }]
        }
      },
      aggregation: { size: 1, type: 'Raw', attributes: { } },
      duration: 0
    });
  });

  test('it recreates a count distinct query with a new name query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 100,
        type: 'COUNT DISTINCT',
        fields: { foo: '1', bar: '2' },
        attributes: { newName: 'cnt' }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 100,
        type: 'Count Distinct',
        groups: [{ field: 'foo', name: '1' }, { field: 'bar', name: '2' }],
        attributes: { newName: 'cnt' }
      },
      duration: 10
    });
  });

  test('it recreates a count distinct query without a new name query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 100,
        type: 'COUNT DISTINCT',
        fields: { foo: '1', bar: '2' }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 100,
        type: 'Count Distinct',
        attributes: { },
        groups: [{ field: 'foo', name: '1' }, { field: 'bar', name: '2' }]
      },
      duration: 10
    });
  });

  test('it recreates a distinct query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'GROUP',
        attributes: { },
        fields: { foo: '1', bar: '2' }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Group',
        attributes: { },
        groups: [{ field: 'foo', name: '1' }, { field: 'bar', name: '2' }]
      },
      duration: 10
    });
  });

  test('it recreates a group all query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'GROUP',
        attributes: {
          operations: [
            { type: 'COUNT', newName: 'cnt' },
            { type: 'SUM', field: 'baz', newName: 'sum' },
            { type: 'MAX', field: 'foo' },
            { type: 'AVG', field: 'bar' },
            { type: 'MIN', field: 'foo' }
          ]
        }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Group',
        attributes: { },
        metrics: [
          { type: 'Count', name: 'cnt' },
          { type: 'Sum', field: 'baz', name: 'sum' },
          { type: 'Maximum', field: 'foo' },
          { type: 'Average', field: 'bar' },
          { type: 'Minimum', field: 'foo' }
        ]
      },
      duration: 10
    });
  });

  test('it recreates a group by query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'GROUP',
        fields: { foo: 'foo', 'complex_map_column.foo': 'bar' },
        attributes: {
          operations: [
            { type: 'COUNT' },
            { type: 'SUM', field: 'baz', newName: 'sum' },
            { type: 'MIN', field: 'foo' }
          ]
        }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Group',
        attributes: { },
        groups: [{ field: 'foo', name: 'foo' }, { field: 'complex_map_column.foo', name: 'bar' }],
        metrics: [
          { type: 'Count' },
          { type: 'Sum', field: 'baz', name: 'sum' },
          { type: 'Minimum', field: 'foo' }
        ]
      },
      duration: 10
    });
  });

  test('it recreates a quantile distribution with number of points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'QUANTILE', numberOfPoints: 15 }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Distribution',
        groups: [{ field: 'foo', name: 'foo' }],
        attributes: { type: 'Quantile', numberOfPoints: 15 }
      },
      duration: 10
    });
  });

  test('it recreates a frequency distribution with number of points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'PMF', numberOfPoints: 15 }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Distribution',
        groups: [{ field: 'foo', name: 'foo' }],
        attributes: { type: 'Frequency', numberOfPoints: 15 }
      },
      duration: 10
    });
  });

  test('it recreates a cumulative frequency distribution with number of points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'CDF', numberOfPoints: 15 }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Distribution',
        groups: [{ field: 'foo', name: 'foo' }],
        attributes: { type: 'Cumulative Frequency', numberOfPoints: 15 }
      },
      duration: 10
    });
  });

  test('it recreates a distribution with generated points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'QUANTILE', start: 0.4, end: 0.6, increment: 0.01 }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Distribution',
        groups: [{ field: 'foo', name: 'foo' }],
        attributes: { type: 'Quantile', start: 0.4, end: 0.6, increment: 0.01 }
      },
      duration: 10
    });
  });

  test('it recreates a distribution with free-form points', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'DISTRIBUTION',
        fields: { foo: 'foo' },
        attributes: { type: 'QUANTILE', points: [0.5, 0.2, 0.75, 0.99] }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Distribution',
        groups: [{ field: 'foo', name: 'foo' }],
        attributes: { type: 'Quantile', points: '0.5,0.2,0.75,0.99' }
      },
      duration: 10
    });
  });

  test('it recreates a top k query correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'TOP K',
        attributes: { },
        fields: { foo: 'foo' }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Top K',
        attributes: { },
        groups: [{ field: 'foo', name: 'foo' }]
      },
      duration: 10
    });
  });

  test('it recreates a top k query with threshold and new name correctly', function(assert) {
    let service = this.owner.lookup('service:querier');
    let query = {
      aggregation: {
        size: 500,
        type: 'TOP K',
        fields: { foo: 'foo' },
        attributes: { newName: 'bar', threshold: 150 }
      },
      duration: 10000
    };
    assertEmberEqual(assert, service.recreate(query), {
      filter: { clause: { condition: 'AND', rules: [] } },
      aggregation: {
        size: 500,
        type: 'Top K',
        groups: [{ field: 'foo', name: 'foo' }],
        attributes: { newName: 'bar', threshold: 150 }
      },
      duration: 10
    });
  });
});

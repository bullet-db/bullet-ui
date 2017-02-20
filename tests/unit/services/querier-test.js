/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import ENV from 'bullet-ui/config/environment';
import { moduleFor, test } from 'ember-qunit';
import MockQuery from '../../helpers/mocked-query';
import FILTERS from '../../fixtures/filters';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';

moduleFor('service:querier', 'Unit | Service | querier', {
});

test('it turns on', function(assert) {
  let service = this.subject();
  assert.ok(service);
});

test('it has the application hostname, namespace and path', function(assert) {
  let service = this.subject();
  service.set('settings', ENV.APP.SETTINGS);
  assert.ok(service);
  assert.equal(service.get('host'), ENV.APP.SETTINGS.drpcHost);
  assert.equal(service.get('namespace'), ENV.APP.SETTINGS.drpcNamespace);
  assert.equal(service.get('path'), ENV.APP.SETTINGS.drpcPath);
});

test('it defaults options correctly', function(assert) {
  let service = this.subject();
  service.set('settings', ENV.APP.SETTINGS);
  let options = service.options('/foo');
  assert.equal(options.url, `${ENV.APP.SETTINGS.drpcHost}/${ENV.APP.SETTINGS.drpcNamespace}/foo`);
  assert.equal(options.type, 'GET');
  assert.equal(options.dataType, 'json');
  assert.equal(options.crossDomain, true);
  assert.deepEqual(options.xhrFields, { withCredentials: true });
});

test('it overrides options correctly', function(assert) {
  let service = this.subject();
  service.set('settings', ENV.APP.SETTINGS);
  let options = service.options('/foo', { type: 'POST', dataType: 'text' });
  assert.equal(options.url, `${ENV.APP.SETTINGS.drpcHost}/${ENV.APP.SETTINGS.drpcNamespace}/foo`);
  assert.equal(options.type, 'POST');
  assert.equal(options.dataType, 'text');
  assert.equal(options.crossDomain, true);
  assert.deepEqual(options.xhrFields, { withCredentials: true });
});

test('it formats a defaulted query correctly', function(assert) {
  let service = this.subject();
  let query = MockQuery.create({ foo: 'bar' });
  assert.deepEqual(service.reformat(query), { duration: 0 });
});

test('it formats an raw aggregation correctly', function(assert) {
  let service = this.subject();
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
  let service = this.subject();
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
  let service = this.subject();
  let query = MockQuery.create({ foo: 'bar' });
  query.addAggregation(AGGREGATIONS.get('RAW'));
  query.set('filter', undefined);
  assert.deepEqual(service.reformat(query), { aggregation: { size: 1, type: 'RAW' }, duration: 0 });
});

test('it formats a filter correctly', function(assert) {
  let service = this.subject();
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
  let service = this.subject();
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
  let service = this.subject();
  let query = MockQuery.create({ duration: 10 });
  query.addAggregation(AGGREGATIONS.get('COUNT_DISTINCT'), 100, { name: 'cnt' });
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
  let service = this.subject();
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
  let service = this.subject();
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
  let service = this.subject();
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
  let service = this.subject();
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

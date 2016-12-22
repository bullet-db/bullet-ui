/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

const RESULTS = {
  SINGLE: {
    meta: {},
    records: [
      {
        foo: 'test',
        timestamp: 1231231231,
        domain: 'foo'
      }
    ]
  },
  MULTIPLE:  {
    meta: {},
    records: [
      {
        foo: 'test1',
        ts: 1231231231,
        domain: 'foo'
      },
      {
        foo: 'test2',
        ts: 1231231232,
        domain: 'bar'
      },
      {
        foo: 'test3',
        ts: 1231231233,
        domain: 'baz'
      }
    ]
  },
  MULTIPLE_MISSING: {
    meta: {},
    records: [
      {
        foo: 'test1',
        ts: 1231231231,
        domain: 'foo'
      },
      {
        foo: 'test2',
        domain: 'bar'
      },
      {
        foo: 'test3'
      }
    ]
  },
  RAW: {
    meta: {},
    records: [
      {
        foo: 'test',
        bar: 1231231233,
        baz: 'baz',
        qux: 'test',
        norf: {
          _t: 'moo',
          _i: 'goo',
          custom: 'gai',
          field: 'pan'
        }
      }
    ]
  }
};

export default RESULTS;

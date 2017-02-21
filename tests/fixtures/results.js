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
  },
  COUNT_DISTINCT: {
    meta: {
      sketchTheta: 0.234,
      wasEstimated: true,
      standardDeviations: {
        1: {
          upperBound: 424242.424242,
          lowerBound: 423131.313131
        },
        2: {
          upperBound: 434343.434343,
          lowerBound: 422121.212121
        }
      }
    },
    records: [
      {
        foo: 424004.3424
      }
    ]
  },
  GROUP: {
    meta: {
      wasEstimated: false,
      standardDeviations: {
        1: {
          upperBound: 3,
          lowerBound: 3
        },
        2: {
          upperBound: 3,
          lowerBound: 3
        },
        3: {
          upperBound: 3,
          lowerBound: 3
        }
      },
      uniquesEstimate: 3
    },
    records: [
      {
        avg_bar: 42.3424,
        COUNT: 1342,
        foo: 'value1',
        bar: 'value2'
      },
      {
        avg_bar: 22.02,
        COUNT: 302,
        foo: 'value1',
        bar: null
      },
      {
        avg_bar: 92.3424,
        COUNT: 234342,
        foo: null,
        bar: 'value2'
      }
    ]
  }
};

export default RESULTS;

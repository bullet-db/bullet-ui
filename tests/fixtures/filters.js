/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
const FILTERS = {
  AND_ENUMERATED: {
    operation: 'AND',
    clauses: [
      {
        operation: '!=' ,
        field: 'enumerated_map_column.nested_1',
        values: ['1', '2', '3']
      },
      {
        operation: '==',
        field: 'simple_column',
        values: ['foo', 'bar']
      }
    ]
  },

  AND_LIST: {
    operation: 'AND',
    clauses: [
      {
        operation: '!=' ,
        field: 'complex_list_column',
        values: ['null']
      },
      {
        operation: '==',
        field: 'simple_column',
        values: ['foo', 'bar']
      }
    ]
  },

  OR_FREEFORM: {
    operation: 'OR',
    clauses: [
      {
        operation: '!=' ,
        field: 'complex_map_column.subfield1',
        values: ['1', '2', '3']
      },
      {
        operation: '==',
        field: 'simple_column',
        values: ['foo', 'bar']
      }
    ]
  }
};

export default FILTERS;

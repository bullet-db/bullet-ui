/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
const COLUMNS = {
  BASIC: {
    data: [
      {
        id: 'simple_column',
        type: 'column',
        attributes: {
          name: 'simple_column',
          type: 'STRING',
          description: 'A simple string column'
        }
      },
      {
        id: 'complex_map_column',
        type: 'column',
        attributes: {
          name: 'complex_map_column',
          type: 'MAP',
          subtype: 'STRING',
          description: 'A complex map of string column'
        }
      },
      {
        id: 'complex_list_column',
        type: 'column',
        attributes: {
          name: 'complex_list_column',
          type: 'LIST',
          subtype: 'MAP',
          description: 'A complex list map of string column'
        }
      },
      {
        id: 'enumerated_map_column',
        type: 'column',
        attributes: {
          name: 'enumerated_map_column',
          type: 'MAP',
          subtype: 'STRING',
          description: 'A enumeration map of string column',
          enumerations: [
            {
              name: 'nested_1',
              description: ''
            },
            {
              name: 'nested_2',
              description: ''
            }
          ]
        }
      }
    ],
    meta: {
      version: '0.0.1'
    }
  }
};

export default COLUMNS;

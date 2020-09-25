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
          type: 'STRING_MAP',
          description: 'A complex map of string column'
        }
      },
      {
        id: 'complex_list_column',
        type: 'column',
        attributes: {
          name: 'complex_list_column',
          type: 'STRING_MAP_LIST',
          description: 'A complex list map of string column'
        }
      },
      {
        id: 'enumerated_map_column',
        type: 'column',
        attributes: {
          name: 'enumerated_map_column',
          type: 'STRING_MAP',
          subFields: [
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
  },

  ALL: {
    data: [
      {
        id: 'boolean',
        type: 'column',
        attributes: {
          name: 'boolean',
          type: 'BOOLEAN'
        }
      },
      {
        id: 'integer',
        type: 'column',
        attributes: {
          name: 'integer',
          type: 'INTEGER'
        }
      },
      {
        id: 'long',
        type: 'column',
        attributes: {
          name: 'long',
          type: 'LONG'
        }
      },
      {
        id: 'float',
        type: 'column',
        attributes: {
          name: 'float',
          type: 'FLOAT'
        }
      },
      {
        id: 'double',
        type: 'column',
        attributes: {
          name: 'double',
          type: 'DOUBLE'
        }
      },
      {
        id: 'string',
        type: 'column',
        attributes: {
          name: 'string',
          type: 'STRING'
        }
      },
      {
        id: 'boolean_map',
        type: 'column',
        attributes: {
          name: 'boolean_map',
          type: 'BOOLEAN_MAP'
        }
      },
      {
        id: 'integer_map',
        type: 'column',
        attributes: {
          name: 'integer_map',
          type: 'INTEGER_MAP'
        }
      },
      {
        id: 'long_map',
        type: 'column',
        attributes: {
          name: 'long_map',
          type: 'LONG_MAP',
          subFields: [
            {
              name: 'long_map_sub_field_1'
            },
            {
              name: 'long_map_sub_field_1'
            }
          ]
        }
      },
      {
        id: 'float_map',
        type: 'column',
        attributes: {
          name: 'float_map',
          type: 'FLOAT_MAP'
        }
      },
      {
        id: 'double_map',
        type: 'column',
        attributes: {
          name: 'double_map',
          type: 'DOUBLE_MAP',
          subFields: [
            {
              name: 'double_map_sub_field_1'
            },
            {
              name: 'double_map_sub_field_1'
            }
          ]
        }
      },
      {
        id: 'string_map',
        type: 'column',
        attributes: {
          name: 'string_map',
          type: 'STRING_MAP'
        }
      },
      {
        id: 'boolean_map_map',
        type: 'column',
        attributes: {
          name: 'boolean_map_map',
          type: 'BOOLEAN_MAP_MAP',
          subFields: [
            {
              name: 'boolean_map_map_sub_field_1'
            }
          ],
          subSubFields: [
            {
              name: 'boolean_map_map_sub_sub_field_2'
            }
          ]
        }
      },
      {
        id: 'integer_map_map',
        type: 'column',
        attributes: {
          name: 'integer_map_map',
          type: 'INTEGER_MAP_MAP',
          subFields: [
            {
              name: 'integer_map_map_sub_field_1'
            }
          ],
          subSubFields: [
            {
              name: 'integer_map_map_sub_sub_field_2'
            }
          ]
        }
      },
      {
        id: 'long_map_map',
        type: 'column',
        attributes: {
          name: 'long_map_map',
          type: 'LONG_MAP_MAP'
        }
      },
      {
        id: 'float_map_map',
        type: 'column',
        attributes: {
          name: 'float_map_map',
          type: 'FLOAT_MAP_MAP',
          subFields: [
            {
              name: 'float_map_map_sub_field_1'
            },
            {
              name: 'float_map_map_sub_field_2'
            }
          ],
          subSubFields: [
            {
              name: 'float_map_map_sub_sub_field_2'
            }
          ]
        }
      },
      {
        id: 'double_map_map',
        type: 'column',
        attributes: {
          name: 'double_map_map',
          type: 'DOUBLE_MAP_MAP'
        }
      },
      {
        id: 'string_map_map',
        type: 'column',
        attributes: {
          name: 'string_map_map',
          type: 'STRING_MAP_MAP',
          subFields: [
            {
              name: 'string_map_map_sub_field_1'
            }
          ],
          subSubFields: [
            {
              name: 'string_map_map_sub_sub_field_1'
            },
            {
              name: 'string_map_map_sub_sub_field_2'
            }
          ]
        }
      },
      {
        id: 'boolean_list',
        type: 'column',
        attributes: {
          name: 'boolean_list',
          type: 'BOOLEAN_LIST'
        }
      },
      {
        id: 'integer_list',
        type: 'column',
        attributes: {
          name: 'integer_list',
          type: 'INTEGER_LIST'
        }
      },
      {
        id: 'long_list',
        type: 'column',
        attributes: {
          name: 'long_list',
          type: 'LONG_LIST'
        }
      },
      {
        id: 'float_list',
        type: 'column',
        attributes: {
          name: 'float_list',
          type: 'FLOAT_LIST'
        }
      },
      {
        id: 'double_list',
        type: 'column',
        attributes: {
          name: 'double_list',
          type: 'DOUBLE_LIST'
        }
      },
      {
        id: 'string_list',
        type: 'column',
        attributes: {
          name: 'string_list',
          type: 'STRING_LIST'
        }
      },
      {
        id: 'boolean_map_list',
        type: 'column',
        attributes: {
          name: 'boolean_map_list',
          type: 'BOOLEAN_MAP_LIST'
        }
      },
      {
        id: 'integer_map_list',
        type: 'column',
        attributes: {
          name: 'integer_map_list',
          type: 'INTEGER_MAP_LIST'
        }
      },
      {
        id: 'long_map_list',
        type: 'column',
        attributes: {
          name: 'long_map_list',
          type: 'LONG_MAP_LIST'
        }
      },
      {
        id: 'float_map_list',
        type: 'column',
        attributes: {
          name: 'float_map_list',
          type: 'FLOAT_MAP_LIST'
        }
      },
      {
        id: 'double_map_list',
        type: 'column',
        attributes: {
          name: 'double_map_list',
          type: 'DOUBLE_MAP_LIST'
        }
      },
      {
        id: 'string_map_list',
        type: 'column',
        attributes: {
          name: 'string_map_list',
          type: 'STRING_MAP_LIST',
          subListFields: [
            {
              name: 'string_map_list_sub_list_field_1',
            },
            {
              name: 'string_map_list_sub_list_field_2',
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

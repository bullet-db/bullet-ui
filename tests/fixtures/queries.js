/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

const QUERIES = {
  BASIC_AND_ENUMERATED_COUNT_DISTINCT:
    'SELECT COUNT(DISTINCT simple_column) ' +
    'FROM STREAM(50000, TIME) ' +
    'WHERE enumerated_map_column.nested_1 NOT IN ["1", "2", "3"] AND SIZEIS(simple_column, 15);',
  BASIC_AND_LIST_TUMBLING_WINDOW:
  'SELECT * ' +
  'FROM STREAM(20000, TIME) ' +
  'WHERE CONTAINSVALUE(complex_list_column, "foo") AND simple_column RLIKE ANY [".foo.+", ".*bar$"] ' +
  'WINDOWING TUMBLING(2000, TIME) ' +
  'LIMIT 1'
};

export default QUERIES;

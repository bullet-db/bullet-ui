/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

const QUERIES = {
  BASIC_AND_ENUMERATED_COUNT_DISTINCT:
    'SELECT COUNT(DISTINCT simple_column) ' +
    'FROM STREAM(50000, TIME) ' +
    'WHERE enumerated_map_column.nested_1 NOT IN ["1", "2", "3"] AND SIZEIS(simple_column, 15) AND ' +
          'CONTAINSKEY(enumerated_map_column, "bar");',
  BASIC_AND_LIST_TUMBLING_WINDOW:
    'SELECT * ' +
    'FROM STREAM(20000, TIME) ' +
    'WHERE CONTAINSVALUE(complex_list_column, "foo") AND simple_column RLIKE ANY [".foo.+", ".*bar$"] ' +
    'WINDOWING TUMBLING(2000, TIME) ' +
    'LIMIT 1',
  ALL_SIMPLE:
    'SELECT * ' +
    'FROM STREAM(10000, TIME) ' +
    ' WHERE string != "foo" ' +
    'LIMIT 10',
  ALL_OPERATORS:
    'SELECT * ' +
    'FROM STREAM(10000, TIME) ' +
    'WHERE string = "" AND boolean_map_map.boolean_map_map_sub_field_1.boolean_map_map_sub_sub_field_2 = true ' +
    'AND ( ' +
    '      string_map_map.string_map_map_sub_field_1.q NOT IN ["gar","age"] OR long IS NULL OR ' +
    '      long_map.long_map_sub_field_1 IN [5,6,3] OR SIZEIS(boolean_list, 12) OR ' +
    '      ( ' +
    '        float_map_map.float_map_map_sub_field_2.float_map_map_sub_sub_field_2 IN [23.1,42,124.23] ' +
    '        AND string != "" AND integer_map.s IN [4,2]' +
    '      ) ' +
    '    ) ' +
    'AND (' +
    '      string_map_list IS NOT NULL OR boolean = true  OR CONTAINSKEY(double_map_list, "xzi") OR ' +
    '      boolean_map.b != false OR CONTAINSVALUE(float_list, 42.1) ' +
    '    ) ' +
    'AND (integer > 0 OR float < 9 OR long_map.q >= 42 OR double_map.double_map_sub_field_2 <= -1) ' +
    'AND string_map_map.string_map_map_sub_field_1.ext RLIKE ANY ["x42.+",".*foo.*"] ' +
    'LIMIT 10',
};

export default QUERIES;

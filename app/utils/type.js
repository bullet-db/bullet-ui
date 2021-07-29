/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Enum from 'bullet-ui/utils/enum';

export const TYPE_SEPARATOR = '_';
export const MAP_ACCESSOR = '.';
export const LIST_ACCESSOR_START = '[';
export const LIST_ACCESSOR_END = ']';
export const FREEFORM = '*';
export const MAP_FREEFORM_SUFFIX = `${MAP_ACCESSOR}${FREEFORM}`;
export const LIST_FREEFORM_SUFFIX = `${LIST_ACCESSOR_START}${FREEFORM}${LIST_ACCESSOR_END}`;

export const TYPE_CLASSES = Enum.of([
  'PRIMITIVE',
  'PRIMITIVE_MAP',
  'PRIMITIVE_LIST',
  'PRIMITIVE_MAP_MAP',
  'PRIMITIVE_MAP_LIST'
]);

const BOOLEAN = { name: 'BOOLEAN', class: TYPE_CLASSES.PRIMITIVE };
const INTEGER = { name: 'INTEGER', class: TYPE_CLASSES.PRIMITIVE };
const LONG = { name: 'LONG', class: TYPE_CLASSES.PRIMITIVE };
const FLOAT = { name: 'FLOAT', class: TYPE_CLASSES.PRIMITIVE };
const DOUBLE = { name: 'DOUBLE', class: TYPE_CLASSES.PRIMITIVE };
const STRING = { name: 'STRING', class: TYPE_CLASSES.PRIMITIVE };
const BOOLEAN_MAP = { name: 'BOOLEAN_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP };
const INTEGER_MAP = { name: 'INTEGER_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP };
const LONG_MAP = { name: 'LONG_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP };
const FLOAT_MAP = { name: 'FLOAT_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP };
const DOUBLE_MAP = { name: 'DOUBLE_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP };
const STRING_MAP = { name: 'STRING_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP };
const BOOLEAN_MAP_MAP = { name: 'BOOLEAN_MAP_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP_MAP };
const INTEGER_MAP_MAP = { name: 'INTEGER_MAP_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP_MAP };
const LONG_MAP_MAP = { name: 'LONG_MAP_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP_MAP };
const FLOAT_MAP_MAP = { name: 'FLOAT_MAP_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP_MAP };
const DOUBLE_MAP_MAP = { name: 'DOUBLE_MAP_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP_MAP };
const STRING_MAP_MAP = { name: 'STRING_MAP_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP_MAP };
const BOOLEAN_LIST = { name: 'BOOLEAN_LIST', class: TYPE_CLASSES.PRIMITIVE_LIST };
const INTEGER_LIST = { name: 'INTEGER_LIST', class: TYPE_CLASSES.PRIMITIVE_LIST };
const LONG_LIST = { name: 'LONG_LIST', class: TYPE_CLASSES.PRIMITIVE_LIST };
const FLOAT_LIST = { name: 'FLOAT_LIST', class: TYPE_CLASSES.PRIMITIVE_LIST };
const DOUBLE_LIST = { name: 'DOUBLE_LIST', class: TYPE_CLASSES.PRIMITIVE_LIST };
const STRING_LIST = { name: 'STRING_LIST', class: TYPE_CLASSES.PRIMITIVE_LIST };
const BOOLEAN_MAP_LIST = { name: 'BOOLEAN_MAP_LIST', class: TYPE_CLASSES.PRIMITIVE_MAP_LIST };
const INTEGER_MAP_LIST = { name: 'INTEGER_MAP_LIST', class: TYPE_CLASSES.PRIMITIVE_MAP_LIST };
const LONG_MAP_LIST = { name: 'LONG_MAP_LIST', class: TYPE_CLASSES.PRIMITIVE_MAP_LIST };
const FLOAT_MAP_LIST = { name: 'FLOAT_MAP_LIST', class: TYPE_CLASSES.PRIMITIVE_MAP_LIST };
const DOUBLE_MAP_LIST = { name: 'DOUBLE_MAP_LIST', class: TYPE_CLASSES.PRIMITIVE_MAP_LIST };
const STRING_MAP_LIST = { name: 'STRING_MAP_LIST', class: TYPE_CLASSES.PRIMITIVE_MAP_LIST };

const UNKNOWN_MAP = { name: 'UNKNOWN_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP };
const UNKNOWN_MAP_MAP = { name: 'UNKNOWN_MAP_MAP', class: TYPE_CLASSES.PRIMITIVE_MAP_MAP };
const UNKNOWN_LIST = { name: 'UNKNOWN_LIST', class: TYPE_CLASSES.PRIMITIVE_LIST };
const UNKNOWN_MAP_LIST = { name: 'UNKNOWN_MAP_LIST', class: TYPE_CLASSES.PRIMITIVE_MAP_LIST };
const UNKNOWN = { name: 'UNKNOWN', class: TYPE_CLASSES.PRIMITIVE}

export const TYPES = Enum.of([
  BOOLEAN, INTEGER, LONG, FLOAT, DOUBLE, STRING,
  BOOLEAN_MAP, INTEGER_MAP, LONG_MAP, FLOAT_MAP, DOUBLE_MAP, STRING_MAP,
  BOOLEAN_MAP_MAP, INTEGER_MAP_MAP, LONG_MAP_MAP, FLOAT_MAP_MAP, DOUBLE_MAP_MAP, STRING_MAP_MAP,
  BOOLEAN_LIST, INTEGER_LIST, LONG_LIST, FLOAT_LIST, DOUBLE_LIST, STRING_LIST,
  BOOLEAN_MAP_LIST, INTEGER_MAP_LIST, LONG_MAP_LIST, FLOAT_MAP_LIST, DOUBLE_MAP_LIST, STRING_MAP_LIST,
  UNKNOWN_MAP, UNKNOWN_MAP_MAP, UNKNOWN_LIST, UNKNOWN_MAP_LIST, UNKNOWN
]);

export function getBasePrimitive(name) {
  return name.split(TYPE_SEPARATOR, 1)[0];
}

export function wrapMapKey(map, key) {
  return `${map}${MAP_ACCESSOR}${key}`;
}

export function wrapListIndex(list, index) {
  return `${list}${LIST_ACCESSOR_START}${index}${LIST_ACCESSOR_END}`;
}

export function extractMapKey(name) {
  let split = name.split(MAP_ACCESSOR, 2);
  let map = split[0];
  if (split.length === 1) {
    return map;
  }
  return split[1];
}

export function extractListIndex(name) {
  let split = name.split(LIST_ACCESSOR_START, 2);
  let list = split[0];
  if (split.length === 1) {
    return list;
  }
  let rest = split[1];
  split = rest.split(LIST_ACCESSOR_END, 2);
  return split[0];
}

export function getSubType(name) {
  let base = getBasePrimitive(name);
  let type = TYPES[name];
  switch (type) {
    case TYPES.BOOLEAN_MAP:
    case TYPES.INTEGER_MAP:
    case TYPES.LONG_MAP:
    case TYPES.FLOAT_MAP:
    case TYPES.DOUBLE_MAP:
    case TYPES.STRING_MAP:
    case TYPES.BOOLEAN_LIST:
    case TYPES.INTEGER_LIST:
    case TYPES.LONG_LIST:
    case TYPES.FLOAT_LIST:
    case TYPES.DOUBLE_LIST:
    case TYPES.STRING_LIST:
    case TYPES.UNKNOWN_MAP:
    case TYPES.UNKNOWN_LIST:
      return base;
    case TYPES.BOOLEAN_MAP_MAP:
    case TYPES.INTEGER_MAP_MAP:
    case TYPES.LONG_MAP_MAP:
    case TYPES.FLOAT_MAP_MAP:
    case TYPES.DOUBLE_MAP_MAP:
    case TYPES.STRING_MAP_MAP:
    case TYPES.BOOLEAN_MAP_LIST:
    case TYPES.INTEGER_MAP_LIST:
    case TYPES.LONG_MAP_LIST:
    case TYPES.FLOAT_MAP_LIST:
    case TYPES.DOUBLE_MAP_LIST:
    case TYPES.STRING_MAP_LIST:
    case TYPES.UNKNOWN_MAP_MAP:
    case TYPES.UNKNOWN_MAP_LIST:
      return `${base}_MAP`;
    case TYPES.BOOLEAN:
    case TYPES.INTEGER:
    case TYPES.LONG:
    case TYPES.FLOAT:
    case TYPES.DOUBLE:
    case TYPES.STRING:
    case TYPES.UNKNOWN:
    default:
      return undefined;
  }
}

export function getTypeClass(name) {
  return TYPES.getMetaEntryForName(name, 'class');
}

export function getTypeDescription(name) {
  let base = getBasePrimitive(name);
  let typeClass = getTypeClass(name);
  switch (typeClass) {
    case TYPE_CLASSES.PRIMITIVE:
      return base;
    case TYPE_CLASSES.PRIMITIVE_MAP:
      return `MAP<STRING, ${base}>`;
    case TYPE_CLASSES.PRIMITIVE_LIST:
      return `LIST<${base}>`;
    case TYPE_CLASSES.PRIMITIVE_MAP_MAP:
      return `MAP<STRING, MAP<STRING, ${base}>>`;
    case TYPE_CLASSES.PRIMITIVE_MAP_LIST:
      return `LIST<MAP<STRING, ${base}>>`;
  }
}

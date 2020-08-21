/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

export class Enum {
  constructor(names) {
    for (let name in names) {
      this[name] = Symbol.for(name);
    }
    Object.freeze(this);
  }

  get symbols() {
    return Object.keys(this).map(name => this[name]);
  }

  get names() {
    return Object.keys(this);
  }

  hasSymbol(symbol) {
    return symbol === this[Symbol.keyFor(symbol)];
  }

  hasName(name) {
    return this[name] !== undefined;
  }

  forName(name) {
    return this[name];
  }

  static of(names) {
    return new Enum(names);
  }
}

export const TYPE_SEPARATOR = '_';
export const MAP_ACCESSOR = '.';
export const LIST_ACCESSOR_START = '[';
export const LIST_ACCESSOR_END = ']';

export const TYPES = Enum.of([
  'BOOLEAN', 'INTEGER', 'LONG', 'FLOAT', 'DOUBLE', 'STRING',
  'BOOLEAN_MAP', 'INTEGER_MAP', 'LONG_MAP', 'FLOAT_MAP', 'DOUBLE_MAP', 'STRING_MAP',
  'BOOLEAN_MAP_MAP', 'INTEGER_MAP_MAP', 'LONG_MAP_MAP', 'FLOAT_MAP_MAP', 'DOUBLE_MAP_MAP', 'STRING_MAP_MAP',
  'BOOLEAN_LIST', 'INTEGER_LIST', 'LONG_LIST', 'FLOAT_LIST', 'DOUBLE_LIST', 'STRING_LIST',
  'BOOLEAN_MAP_LIST', 'INTEGER_MAP_LIST', 'LONG_MAP_LIST', 'FLOAT_MAP_LIST', 'DOUBLE_MAP_LIST', 'STRING_MAP_LIST'
]);

export const TYPE_CLASSES = Enum.of([
  'PRIMITIVE', 'PRIMITIVE_MAP', 'PRIMITIVE_LIST', 'PRIMITIVE_MAP_MAP', 'PRIMITIVE_MAP_LIST'
]);

export function getBasePrimitive(name) {
    return name.split(TYPE_SEPARATOR, 1);
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

export function getSubType(type) {
  let base = getBasePrimitive(type);
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
      return TYPES[base];
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
      return TYPES[`${base}_MAP`];
    case TYPES.BOOLEAN:
    case TYPES.INTEGER:
    case TYPES.LONG:
    case TYPES.FLOAT:
    case TYPES.DOUBLE:
    case TYPES.STRING:
    default:
      return undefined;
  }
}

export function getTypeClass(name) {
  if (name.indexOf('_MAP_MAP') !== -1) {
    return TYPE_CLASSES.PRIMITIVE_MAP_MAP;
  } else if (name.indexOf('_MAP_LIST') !== -1) {
    return TYPE_CLASSES.PRIMITIVE_MAP_LISTS;
  } else if (name.indexOf('_MAP') !== -1) {
    return TYPE_CLASSES.PRIMITIVE_MAP;
  } else if (name.indexOf('_LIST') !== -1) {
    return TYPE_CLASSES.PRIMITIVE_LIST;
  } else {
    return TYPE_CLASSES.PRIMITIVE;
  }
}

export function getTypeDescription(type, typeClass) {
  let base = getBasePrimitive(type);
  switch (typeClass) {
    case TYPE_CLASSES.PRIMITIVE:
      return base;
    case TYPE_CLASSES.PRIMITIVE_MAP:
      return `MAP OF STRING TO ${base}`;
    case TYPE_CLASSES.PRIMITIVE_LIST:
      return `LIST OF ${base}`;
    case TYPE_CLASSES.PRIMITIVE_MAP_MAP:
      return `MAP OF STRING TO (MAP OF STRING TO ${base})`;
    case TYPE_CLASSES.PRIMITIVE_MAP_LIST:
      return `LIST OF (MAP OF STRING TO ${base})`;
  }
}

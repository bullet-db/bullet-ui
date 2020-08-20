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

export const SUBFIELD_SEPARATOR = '.';

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

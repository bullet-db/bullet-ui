/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

export default class Enum {
  metadata = { };
  names = [];

  constructor(values) {
    for (let value of values) {
      let name;
      if (typeof value === 'string') {
        name = value;
      } else if (typeof value === 'object') {
        name = value.name;
      } else {
        throw new TypeError('Enum values must be string or object');
      }
      if (name === 'metadata' || name === 'names') {
        throw new TypeError('Enum names must not include metadata or names');
      }
      this[name] = Symbol.for(name);
      this.names.push(name);
      this.metadata[name] = value;
    }
    Object.freeze(this.metadata);
    Object.freeze(this.names);
    Object.freeze(this);
  }

  get symbols() {
    return this.names.map(name => this[name]);
  }

  get names() {
    return this.names;
  }

  hasSymbol(symbol) {
    return symbol === this[this.forSymbol(symbol)];
  }

  hasName(name) {
    return this[name] !== undefined;
  }

  forName(name) {
    return this[name];
  }

  forSymbol(symbol) {
    return Symbol.keyFor(symbol);
  }

  getMetaForName(name) {
    return this.metadata[name];
  }

  getMetaForSymbol(symbol) {
    return this.getMetaForName(this.forSymbol(symbol));
  }

  getMetaEntryForName(name, key) {
    return this.getMetaForName(name)?.[key];
  }

  getMetaEntryForSymbol(symbol, key) {
    return this.getMetaEntryForName(this.forSymbol(symbol), key);
  }

  static of(names) {
    return new Enum(names);
  }
}

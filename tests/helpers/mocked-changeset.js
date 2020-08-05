/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
  export default class MockChangeset {
    field;
    name = null;
    isInvalid = false;
    error;
    shouldError;
    modifications = [];

    constructor(fields, shouldError, error) {
      fields.forEach(field => {
        this[field.name] = field.value;
      })
      this.shouldError = shouldError;
      this.error = error;
    }

    set(path, value) {
      this.modifications.push({ [path]: value });
    }

    get(path) {
      // If there's a dot, we can go one deep
      let last = path.lastIndexOf('.');
      return last !== -1 ? this[path.slice(0, last)][path.slice(last + 1)] : this[path];
    }

    validate() {
      return new Promise(resolve => {
        if (this.shouldError(this)) {
          this.isInvalid = true;
          resolve(this.error);
        } else {
          resolve({ });
        }
      });
    }

    save() {
    }
  }

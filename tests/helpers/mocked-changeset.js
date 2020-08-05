/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
  export default class MockChangeset {
    type;
    field;
    name = null;
    isInvalid = false;
    error;
    shouldError;
    modifications = [];

    constructor(field, shouldError, errors) {
      this.field = field;
      this.shouldError = shouldError;
      this.error = errors;
    }

    set(path, value) {
      this.modifications.push({ [path]: value });
    }

    get(path) {
      // If there's a dot, it's accessing this.error
      let last = path.lastIndexOf('.');
      return last !== -1 ? this.error[path.slice(last + 1)] : this[path];
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

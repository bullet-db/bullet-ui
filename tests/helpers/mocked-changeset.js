/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { get } from '@ember/object';

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
    return get(this, path);
  }

  validate() {
    return new Promise(resolve => {
      if (this.shouldError(this)) {
        this.isInvalid = true;
      }
      resolve();
    });
  }

  save() {
  }
}

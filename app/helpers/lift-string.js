/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export function liftString([key, value]) {
  if (Ember.typeOf(value) !== 'string') {
    return value;
  }
  return Ember.Object.create({ [key]: value });
}

export default Ember.Helper.helper(liftString);

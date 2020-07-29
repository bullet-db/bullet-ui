/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { get } from '@ember/object';

 /*
  * Sourced and modified from:
  * https://github.com/emberjs/ember.js/blob/v3.16.0/packages/@ember/-internals/metal/lib/is_empty.ts

  * This exists because there is a bug in the function starting in Ember 3.1, which breaks for Proxy objects
  * https://github.com/emberjs/ember.js/issues/17032
  */
export default function isEmpty(obj) {
  if (obj === null || obj === undefined) {
    return true;
  }
  let size = get(obj, 'size');
  let length = get(obj, 'length');
  if (typeof size === 'number' || typeof length === 'number') {
    return size === 0 || length === 0;
  }
  return false;
}

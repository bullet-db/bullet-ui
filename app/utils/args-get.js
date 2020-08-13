/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isNone } from '@ember/utils';

export default function argsGet(args, path, defaultValue) {
  let value = args[path];
  return isNone(value) ? defaultValue : value;
}

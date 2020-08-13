/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { get } from '@ember/object';
import isEmpty from 'bullet-ui/utils/is-empty';

export default function currentValue(changes, content, keys = []) {
  let result = { };
  keys.forEach(key => {
    let value = get(changes, key);
    if (isEmpty(value)) {
      value = get(content, key);
    }
    result[key] = value;
  });
  return result;
}

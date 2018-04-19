/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import EmberObject from '@ember/object';
import { typeOf } from '@ember/utils';

export function liftString([key, value]) {
  if (typeOf(value) !== 'string') {
    return value;
  }
  return EmberObject.create({ [key]: value });
}

export default buildHelper(liftString);

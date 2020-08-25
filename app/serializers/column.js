/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class ColumnSerializer extends JSONAPISerializer {
  // Do not change camelCased attributes to dasherized attributes in the payload
  keyForAttribute(attribute) {
    return attribute;
  }
}

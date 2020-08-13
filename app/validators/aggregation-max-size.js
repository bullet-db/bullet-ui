/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import currentValue from 'bullet-ui/utils/current-value';

export default function validateAggregationMaxSize() {
  return (key, newSize, oldSize, changes, content) => {
    const RAW = AGGREGATIONS.get('RAW');
    let { type } = currentValue(changes, content, ['type']);
    let maxRawSize = content.get('settings.defaultValues.rawMaxSize');
    let maxSize = content.get('settings.defaultValues.aggregationMaxSize');
    if (isEqual(type, RAW) && newSize > maxRawSize) {
      return `The maintainer has set the ${RAW} type to support a maximum of ${maxRawSize} for result count`;
    } else if (newSize > maxSize) {
      return `The maintainer has configured Bullet to support a maximum of ${maxSize} for result count`;
    }
    return true;
  }
}

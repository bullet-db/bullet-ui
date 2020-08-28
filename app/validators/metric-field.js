/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty, isEqual } from '@ember/utils';
import currentValue from 'bullet-ui/utils/current-value';
import { METRIC_TYPES } from 'bullet-ui/utils/query-constants';

export default function validateMetricField() {
  return (key, newValue, oldValue, changes, content) => {
    const COUNT = METRIC_TYPES.describe(METRIC_TYPES.COUNT);
    let { type, field } = currentValue(changes, content, ['type', 'field']);
    if (!isEmpty(field) || isEqual(type, COUNT)) {
      return true;
    }
    return `All metrics but ${COUNT} require a field`;
  }
}

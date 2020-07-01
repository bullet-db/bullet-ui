/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty, isEqual } from '@ember/utils';
import { METRICS } from 'bullet-ui/models/metric';
import currentValue from 'bullet-ui/utils/current-value';

export default function validateMetricField() {
  return (key, newFieldValue, oldFieldValue, changes, content) => {
    const COUNT = METRICS.get('COUNT');
    let { type } = currentValue(changes, content, ['type']);
    if (!isEmpty(newFieldValue) || isEqual(type, COUNT)) {
      return true;
    }
    return `All metrics but ${COUNT} require a field`;
  }
}

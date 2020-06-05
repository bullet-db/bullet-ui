/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual, isEmpty } from '@ember/utils';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import currentValue from 'bullet-ui/utils/current-value';

export default function validatePoints() {
  return (key, newType, oldType, changes, content) => {
    let {
      'aggregation.groups' : groups,
      'aggregation.metrics' : metrics
  } = currentValue(changes, content, ['aggregation.groups', 'aggregation.metrics']);

    if (isEqual(newType, AGGREGATIONS.get('GROUP')) && isEmpty(groups) && isEmpty(metrics)) {
      return 'If you are grouping data, you must add at least one Group Field and/or Metric Field';
    }
    return true;
  }
}

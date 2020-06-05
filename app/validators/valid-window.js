/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';
import currentValue from 'bullet-ui/utils/current-value';

export default function validateWindow() {
  return (key, newValue, oldValue, changes, content) => {
    let { 'aggregation.type': aggregationType, 'window.emitType': emitType, 'window.includeType': includeType } =
        currentValue(changes, content, ['aggregation.type', 'window.emitType', 'window.includeType']);
    if (isEqual(aggregationType, AGGREGATIONS.get('RAW')) && isEqual(includeType, INCLUDE_TYPES.get('ALL'))) {
      return 'The window should not include all from start when aggregation type is Raw';
    }
    if (!isEqual(aggregationType, AGGREGATIONS.get('RAW')) && isEqual(emitType, EMIT_TYPES.get('RECORD'))) {
      return 'The window should not be record based when aggregation type is not Raw';
    }
    return true;
  }
}

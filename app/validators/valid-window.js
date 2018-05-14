/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';
import BaseValidator from 'ember-cp-validations/validators/base';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';

const ValidWindow = BaseValidator.extend({
  validate(value, options, model) {
    let aggregationType = model.get('aggregation.type');
    let emitType = model.get('window.emit.type');
    let includeType = model.get('window.include.type');
    if (isEqual(aggregationType, AGGREGATIONS.get('RAW')) && isEqual(includeType, INCLUDE_TYPES.get('ALL'))) {
      return `The window should not include all from start when aggregation type is RAW`;
    }
    if (!isEqual(aggregationType, AGGREGATIONS.get('RAW')) && isEqual(emitType, EMIT_TYPES.get('RECORD'))) {
      return `The window should not be record based when aggregation type is not RAW`;
    }
    return true;
  }
});

ValidWindow.reopenClass({
  getDependentsFor() {
    return ['model.aggregation.type', 'model.window.emit.type', 'model.window.include.type'];
  }
});

export default ValidWindow;

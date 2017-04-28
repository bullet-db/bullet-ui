/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

const AggregationSize = BaseValidator.extend({
  validate(value, options, model) {
    const RAW = AGGREGATIONS.get('RAW');
    let type = model.get('type');
    let maxRawSize = model.get('settings.defaultValues.rawMaxSize');
    let maxSize = model.get('settings.defaultValues.aggregationMaxSize');
    if (Ember.isEqual(type, RAW) && value > maxRawSize) {
      return `The maintainer has set the ${RAW} output data type to support a maximum of ${maxRawSize} result count`;
    } else if (value > maxSize) {
      return `The maintainer has configured Bullet to support a maximum of ${maxSize} for result count`;
    }
    return true;
  }
});

AggregationSize.reopenClass({
  getDependentsFor() {
    return ['model.type'];
  }
});

export default AggregationSize;

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';
import { METRICS } from 'bullet-ui/models/metric';

const MetricField = BaseValidator.extend({
  validate(value, options, model) {
    const COUNT = METRICS.get('COUNT');
    let type = model.get('type');
    if (!Ember.isEmpty(value) || Ember.isEqual(type, COUNT)) {
      return true;
    }
    return `All metrics but ${COUNT} require a field`;
  }
});

MetricField.reopenClass({
  getDependentsFor() {
    return ['model.type'];
  }
});

export default MetricField;

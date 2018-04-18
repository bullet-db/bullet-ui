/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual, isEmpty } from '@ember/utils';
import BaseValidator from 'ember-cp-validations/validators/base';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

const GroupMetricPresence = BaseValidator.extend({
  validate(value, options, model) {
    let type = model.get('type');
    let groups = model.get('groups');
    let metrics = model.get('metrics');
    if (isEqual(type, AGGREGATIONS.get('GROUP')) && isEmpty(groups) && isEmpty(metrics)) {
      return 'If you are grouping data, you must add at least one Group Field and/or Metric Field';
    }
    return true;
  }
});

GroupMetricPresence.reopenClass({
  getDependentsFor() {
    return ['model.type', 'model.groups.[]', 'model.metrics.[]'];
  }
});

export default GroupMetricPresence;

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

const CountDistinctFieldPresence = BaseValidator.extend({
  validate(value, options, model) {
    let type = model.get('type');
    let groups = model.get('groups');
    if (type === AGGREGATIONS.get('COUNT_DISTINCT') && Ember.isEmpty(groups)) {
      return 'If you are counting distincts, you must add at least one Field to count distinct on';
    }
    return true;
  }
});

CountDistinctFieldPresence.reopenClass({
  getDependentsFor() {
    return ['model.type', 'model.groups.[]'];
  }
});

export default CountDistinctFieldPresence;

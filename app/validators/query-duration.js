/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import BaseValidator from 'ember-cp-validations/validators/base';

const QueryDuration = BaseValidator.extend({
  validate(value, options, model) {
    let maxDuration = model.get('settings.defaultValues.maxDurationSecs');
    if (value > maxDuration) {
      return `The maintainer has configured Bullet to support a maximum of ${maxDuration} s for maximum duration`;
    }
    return true;
  }
});

export default QueryDuration;

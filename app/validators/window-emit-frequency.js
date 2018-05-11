/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';
import BaseValidator from 'ember-cp-validations/validators/base';
import { EMIT_TYPES } from 'bullet-ui/models/window';

const WindowEmitFrequency = BaseValidator.extend({
  validate(value, options, model) {
    let emitType = model.get('emitType');
    let timeWindowEmitFrequncyMinSecs = model.get('settings.defaultValues.timeWindowEmitFrequncyMinSecs');
    if (isEqual(emitType, EMIT_TYPES.get('TIME'))) {
      let duration = model.get('query.duration');
      if (value > duration) {
        return `The window emit frequency should not be longer than the query duration (${duration} seconds)`;
      } else if (value < timeWindowEmitFrequncyMinSecs) {
        return `The maintainer has configured Bullet to support a minimum of ${timeWindowEmitFrequncyMinSecs} for emit frequency`;
      }
    }
    return true;
  }
});

WindowEmitFrequency.reopenClass({
  getDependentsFor() {
    return ['model.query.duration', 'model.emitType'];
  }
});

export default WindowEmitFrequency;

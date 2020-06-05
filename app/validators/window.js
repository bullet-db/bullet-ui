/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { validatePresence, validateNumber } from 'ember-changeset-validations/validators';
import validateWindowEmitFrequency from 'bullet-ui/validators/window-emit-frequency';

export default {
  emitEvery: [
    validatePresence({ presence: true, ignoreBlank: true, message: 'Emit frequency must not be blank' }),
    validateNumber({ gte: 1, message: 'Emit frequency must be a positive integer' }),
    validateWindowEmitFrequency()
  ]
}

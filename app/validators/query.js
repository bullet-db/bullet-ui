/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { validatePresence, validateNumber } from 'ember-changeset-validations/validators';
import validateQueryMaxDuration from 'bullet-ui/validators/query-max-duration';

export default {
  duration: [
    validatePresence({ presence: true, ignoreBlank: true, message: 'Duration must be present' }),
    validateNumber({ gte: 1, message: '{description} must be a positive integer' }),
    validateQueryMaxDuration()
  ]
}

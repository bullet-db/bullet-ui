/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  field: [
    validatePresence({ presence: true, ignoreBlank: true, message: 'No field selected' })
  ]
}

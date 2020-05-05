/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

let Validations = buildValidations({
  field: validator('presence', {
    presence: true,
    message: 'No field selected'
  }),
  query: validator('belongs-to')
});

export default Model.extend(Validations, {
  field: attr('string'),
  name: attr('string'),
  query: belongsTo('query', { autoSave: true })
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

let Validations = buildValidations({
  field: validator('presence', {
    presence: true,
    message: 'No field selected'
  }),
  query: validator('belongs-to')
});

export default DS.Model.extend(Validations, {
  field: DS.attr('string'),
  name: DS.attr('string'),
  query: DS.belongsTo('query', { autoSave: true })
});

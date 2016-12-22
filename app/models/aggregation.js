/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

let Aggregation = Ember.Object.extend({
  LIMIT: 'LIMIT',
  COUNT: 'COUNT'
});

export const AGGREGATIONS = Aggregation.create();

let Validations = buildValidations({
  size: {
    description: 'Maximum records',
    validators: [
      validator('presence', true),
      validator('number', {
        integer: true,
        allowString: true,
        gte: 1,
        message: 'Maximum records must be a positive integer'
      })
    ]
  },
  query: validator('belongs-to')
});

export default DS.Model.extend(Validations, {
  type: DS.attr('string', { defaultValue: AGGREGATIONS.get('LIMIT') }),
  size: DS.attr('number', { defaultValue: 1 }),
  query: DS.belongsTo('query', { autoSave: true })
});

/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import EmberObject from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import { equal } from '@ember/object/computed';

let EmitTypes = EmberObject.extend({
  TIME: 'Time Based',
  RECORD: 'Record Based',

  init() {
    this._super(...arguments);
    this.set('API', {
      'Time Based': 'TIME',
      'Record Based': 'RECORD'
    });
  },

  apiKey(key) {
    return this.get(`API.${key}`);
  }
});

let IncludeTypes = EmberObject.extend({
  WINDOW: 'Everything in Window',
  ALL: 'Everything from Start of Query',

  init() {
    this._super(...arguments);
    this.set('API', {
      'Everything from Start of Query': 'ALL'
    });
  },

  apiKey(key) {
    return this.get(`API.${key}`);
  }
});

export const EMIT_TYPES = EmitTypes.create();
export const INCLUDE_TYPES = IncludeTypes.create();

let Validations = buildValidations({
  'emit.every': {
    description: 'Emit frequency', validators: [
      validator('presence', true),
      validator('number', {
        integer: true,
        allowString: true,
        gte: 1,
        message: 'Emit frequency must be a positive integer'
      }),
      validator('window-emit-frequency')
    ]
  },
  query: validator('belongs-to')
});

export default Model.extend(Validations, {
  emit: attr({
    defaultValue() {
      return EmberObject.create({
        type: EMIT_TYPES.get('TIME'),
        every: 2
      });
    }
  }),
  include: attr({
    defaultValue() {
      return EmberObject.create({
        type: INCLUDE_TYPES.get('WINDOW')
      });
    }
  }),
  query: belongsTo('query', { autoSave: true }),

  isTimeBased: equal('emit.type', EMIT_TYPES.get('TIME'))
});

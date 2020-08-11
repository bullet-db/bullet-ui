/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import EmberObject from '@ember/object';
import { equal } from '@ember/object/computed';

let EmitTypes = EmberObject.extend({
  init() {
    this._super(...arguments);
    let names = { TIME: 'Time Based', RECORD: 'Record Based' }
    this.setProperties(names);
    this.set('NAMES', names);
    this.set('API', { 'Time Based': 'TIME', 'Record Based': 'RECORD' });
  },

  apiKey(key) {
    return this.get(`API.${key}`);
  }
});

let IncludeTypes = EmberObject.extend({
  init() {
    this._super(...arguments);
    let names = { WINDOW: 'Everything in Window', ALL: 'Everything from Start of Query' };
    this.setProperties(names);
    this.set('NAMES', names);
    this.set('API', { 'Everything from Start of Query': 'ALL' });
  },

  apiKey(key) {
    return this.get(`API.${key}`);
  }
});

export const EMIT_TYPES = EmitTypes.create();
export const INCLUDE_TYPES = IncludeTypes.create();

export default class WindowModel extends Model {
  @attr('string', { defaultValue: EMIT_TYPES.get('TIME') }) emitType;
  @attr('number', { defaultValue: 2 }) emitEvery;
  @attr('string', { defaultValue: INCLUDE_TYPES.get('WINDOW') }) includeType;
  @belongsTo('query', { autoSave: true }) query;

  @equal('emitType', EMIT_TYPES.get('TIME')) isTimeBased;
}

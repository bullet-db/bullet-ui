/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
  metadata: DS.attr({
    defaultValue() {
      return EmberObject.create();
    }
  }),
  records: DS.attr({
    defaultValue() {
      return A();
    }
  }),
  created: DS.attr('date', {
    defaultValue() {
      return new Date(Date.now());
    }
  }),
  result: DS.belongsTo('result', { autoSave: true }),
  pivotOptions: DS.attr('string')
});

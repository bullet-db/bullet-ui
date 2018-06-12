/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import DS from 'ember-data';
import { A } from '@ember/array';

export default DS.Transform.extend({
  deserialize(serialized) {
    return A(serialized);
  },

  serialize(deserialized) {
    let array = [];
    deserialized.forEach(item => array.push(item));
    return array;
  }
});

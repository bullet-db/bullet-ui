/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import ApplicationSerializer from './application';
import { A } from '@ember/array';

export default ApplicationSerializer.extend({
  serialize(snapshot, options) {
    let json = this._super(...arguments);
    let segments = json.data.attributes.segments || A();
    let array = [];
    segments.forEach(segment => array.push(segment));
    json.data.attributes.segments = array;
    return json;
  },

  normalizeResponse() {
    let json = this._super(...arguments);
    let segments = json.data.attributes.segments;
    json.data.attributes.segments = A(segments);
    return json;
  }
});

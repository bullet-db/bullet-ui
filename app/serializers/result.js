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
    let windows = json.data.attributes.windows || A();
    let array = [];
    windows.forEach(w => array.push(w));
    json.data.attributes.windows = array;
    return json;
  },

  normalizeResponse() {
    let json = this._super(...arguments);
    let windows = json.data.attributes.windows;
    json.data.attributes.windows = A(windows);
    return json;
  }
});

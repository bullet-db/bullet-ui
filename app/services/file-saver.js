/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Service.extend({
  save(data, mimeType, name) {
    window.saveAs(new Blob([data], { type: mimeType }), name);
  }
});

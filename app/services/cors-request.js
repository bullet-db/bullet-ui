/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import AjaxService from 'ember-ajax/services/ajax';
import parseResponseHeaders from 'ember-ajax/utils/parse-response-headers';
import { isAjaxError } from 'ember-ajax/errors';

export default AjaxService.extend({
  options(url, options) {
    let hash = this._super(url, options);
    hash.crossDomain = true;
    hash.xhrFields = { withCredentials: true };
    return hash;
  },

  parseHeaders() {
    return parseResponseHeaders(...arguments);
  },

  hasAjaxError() {
    return isAjaxError(...arguments);
  }
});

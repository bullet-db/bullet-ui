/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import LFAdapter from 'ember-localforage-adapter/adapters/localforage';
import ENV from 'bullet-ui/config/environment';

export default LFAdapter.extend({
  caching: ENV.APP.LOCALFORAGE_CACHING
});

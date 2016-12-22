/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp();
      // Instead of outrightly adding code to disable this, forcing it to not have the required settings
      this.application.register('issueCollectorSettings:mocked', Ember.Object.create(), { instantiate: false });
      this.application.inject('controller', 'issueCollectorSettings', 'issueCollectorSettings:mocked');

      if (options.beforeEach) {
        options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      if (options.afterEach) {
        options.afterEach.apply(this, arguments);
      }
      destroyApp(this.application);
    }
  });
}

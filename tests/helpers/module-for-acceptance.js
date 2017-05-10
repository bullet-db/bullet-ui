/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

const { RSVP: { Promise } } = Ember;

export default function(name, options = {}) {
  let logger;
  const NOOP = () => { };
  const LOGGER = { log: NOOP, warn: NOOP, error: NOOP, assert: NOOP, debug: NOOP, info: NOOP };

  module(name, {
    beforeEach() {
      this.application = startApp();

      if (options.suppressLogging) {
        logger = Ember.Logger;
        Ember.Logger = LOGGER;
      }

      if (options.beforeEach) {
        return options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      if (options.suppressLogging) {
        Ember.Logger = logger;
      }
      let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
      return Promise.resolve(afterEach).then(() => destroyApp(this.application));
    }
  });
}

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import MockStompCLient from '../../tests/helpers/mock-stompclient';
import sinon from 'sinon';
import Stomp from 'npm:@stomp/stompjs';

const { RSVP: { Promise } } = Ember;

export default function(name, options = {}) {
  let logger;
  const NOOP = () => { };
  const LOGGER = { log: NOOP, warn: NOOP, error: NOOP, assert: NOOP, debug: NOOP, info: NOOP };

  module(name, {
    beforeEach() {
      this.application = startApp();

      this.mockStompCLient = MockStompCLient.create();
      this.stub = sinon.stub(Stomp, 'over').returns(this.mockStompCLient);

      if (options.suppressLogging) {
        [logger, Ember.Logger] = [Ember.Logger, LOGGER];
      }

      if (options.beforeEach) {
        return options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      this.stub.restore();
      if (options.suppressLogging) {
        Ember.Logger = logger;
      }
      let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
      return Promise.resolve(afterEach).then(() => destroyApp(this.application));
    }
  });
}

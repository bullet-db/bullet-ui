/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module } from 'qunit';
import { resolve } from 'rsvp';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import mockedAPI from '../helpers/mocked-api';
import sinon from 'sinon';
import Stomp from 'npm:@stomp/stompjs';

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp();

      this.mockedAPI = mockedAPI.create();
      this.stub = sinon.stub(Stomp, 'over').returns(this.mockedAPI);

      if (options.beforeEach) {
        return options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      this.mockedAPI.shutdown();
      this.stub.restore();
      let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
      return resolve(afterEach).then(() => destroyApp(this.application));
    }
  });
}

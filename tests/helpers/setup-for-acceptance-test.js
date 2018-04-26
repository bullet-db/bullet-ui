/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { setupApplicationTest } from 'ember-qunit';
import mockedAPI from './mocked-api';
import sinon from 'sinon';
import Stomp from 'npm:@stomp/stompjs';
import registerPowerSelectHelpers from 'ember-power-select/test-support/helpers';

export default function(hooks, results, columns) {
  registerPowerSelectHelpers();
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.suppressLogging = true;

    this.mockedAPI = mockedAPI.create();
    this.stub = sinon.stub(Stomp, 'over').returns(this.mockedAPI);
    this.mockedAPI.mock(results, columns);

    // Wipe out localstorage because we are creating here
    window.localStorage.clear();
  });

  hooks.afterEach(function() {
    // Wipe out localstorage because we are creating here
    window.localStorage.clear();

    this.mockedAPI.shutdown();
    this.stub.restore();
  });
}

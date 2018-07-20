/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { setupApplicationTest } from 'ember-qunit';
import MockedAPI from './mocked-api';
import sinon from 'sinon';
import Stomp from 'npm:@stomp/stompjs';
import registerPowerSelectHelpers from 'ember-power-select/test-support/helpers';

export function setupForMockSettings(hooks, defaultQuery) {
  hooks.beforeEach(function() {
    this.owner.register('settings:mocked', EmberObject.create({ defaultQuery: defaultQuery }), { instantiate: false });
    this.owner.inject('route', 'settings', 'settings:mocked');
  });

  hooks.afterEach(function() {
    this.owner.unregister('settings:mocked');
  });
}

export function basicSetupForAcceptanceTest(hooks) {
  registerPowerSelectHelpers();
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.suppressLogging = true;
    window.localStorage.clear();
  });

  hooks.afterEach(function() {
    window.localStorage.clear();
  });
}


export function setupForAcceptanceTest(hooks, results, columns) {
  basicSetupForAcceptanceTest(hooks);

  hooks.beforeEach(function() {
    this.mockedAPI = MockedAPI.create();
    this.stub = sinon.stub(Stomp, 'over').returns(this.mockedAPI);
    this.mockedAPI.mock(results, columns);
  });

  hooks.afterEach(function() {
    this.mockedAPI.shutdown();
    this.stub.restore();
  });
}

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { mockAPI } from '../helpers/pretender';
import mockWebsocket from '../../tests/helpers/mock-websocket';

let server, mockSocket;

moduleForAcceptance('Acceptance | query error', {
  suppressLogging: true,

  beforeEach() {
    this.application.register('service:mockWebsocket', mockWebsocket);
    this.application.inject('service:querier', 'websocket', 'service:mockWebsocket');
    mockSocket = this.application.__container__.lookup('service:mockWebsocket');

    server = mockAPI(COLUMNS.BASIC);
    mockSocket.mockAPI(RESULTS.MULTIPLE);
  },

  afterEach() {
    server.shutdown();
  }
});

test('visiting a non-existant query', function(assert) {
  visit('/query/foo');

  andThen(function() {
    assert.equal(currentURL(), '/errored');
  });
});

/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { mockAPI, failAPI } from './pretender';

export default Ember.Object.extend({
  type: null,
  data: null,
  server: null,

  mock(data, columns, delay = 0) {
    this.set('type', 'mockAPI');
    this.set('data', data);
    this.set('server', mockAPI(columns, delay));
  },

  fail(columns) {
    this.set('type', 'failAPI');
    this.set('server', failAPI(columns));
  },

  shutdown() {
    let server = this.get('server');
    if (server !== null) {
      server.shutdown();
    }
  },

  connect(_, onStompConnect, onStompError) {
    if (this.get('type') === 'mockAPI') {
      onStompConnect();
    } else {
      onStompError();
    }
  },

  subscribe(_, onStompMessage) {
    this.set('onStompMessage', onStompMessage);
  },

  send() {
    let onStompMessage = this.get('onStompMessage');
    if (onStompMessage != null) {
      let response = {
        body: JSON.stringify({
          type: 'COMPLETE',
          content: JSON.stringify(this.get('data'))
        })
      };
      onStompMessage(response);
    }
  },

  disconnect() {}
});

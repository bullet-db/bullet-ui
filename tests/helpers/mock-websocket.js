/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

let MockStompClient = Ember.Object.extend({
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

export default Ember.Service.extend({
  mockAPI(data) {
    this.set('type', 'mockAPI');
    this.set('data', data);
  },

  failAPI() {
    this.set('type', 'failAPI');
    this.set('data', null);
  },

  createStompClient() {
    let client = MockStompClient.create({
      type: this.get('type'),
      data: this.get('data')
    });
    return client;
  }
});

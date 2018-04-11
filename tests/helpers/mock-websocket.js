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
    this.onStompMessage = onStompMessage;
  },

  send() {
    let response = {
      body: JSON.stringify({
        type : 'COMPLETE',
        content: JSON.stringify(this.get('data'))
      })
    };
    this.onStompMessage(response);
  },
  
  disconnect() {
  }
});

export default Ember.Service.extend({
  mockAPI(data) {
    this.type = 'mockAPI';
    this.data = data;
  },

  failAPI() {
    this.type = 'failAPI';
    this.data = null;
  },

  createStompClient() {
    let client = MockStompClient.create({
      type: this.type,
      data: this.data
    });
    return client;
  }
});

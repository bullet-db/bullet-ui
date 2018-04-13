/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { mockAPI, failAPI } from './pretender';

export default Ember.Object.extend({
  type: null,
  dataArray: null,
  server: null,

  mock(dataArray, columns, delay = 0) {
    this.set('type', 'mockAPI');
    this.set('dataArray', dataArray);
    this.set('server', mockAPI(columns, delay));
  },

  fail(columns) {
    this.set('type', 'failAPI');
    this.set('server', failAPI(columns));
  },

  shutdown() {
    let server = this.get('server');
    if (server) {
      server.shutdown();
    }
  },

  connect(_, onStompConnect, onStompError) {
    if (Ember.isEqual(this.get('type'), 'mockAPI')) {
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
    let dataArray = this.get('dataArray');
    if (onStompMessage && !Ember.isEmpty(dataArray)) {
      let length = dataArray.length;
      dataArray.forEach((data, i) => {
        let responeType = 'MESSAGE';
        if (Ember.isEqual(i, length - 1)) {
          responeType = 'COMPLETE';
        }
        let response = {
          body: JSON.stringify({
            type: responeType,
            content: JSON.stringify(data)
          })
        };
        onStompMessage(response);
      });
    }
  },

  disconnect() {}
});

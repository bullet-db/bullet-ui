/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual, isEmpty } from '@ember/utils';
import EmberObject from '@ember/object';
import { mockAPI, failAPI } from './pretender';

export default EmberObject.extend({
  type: null,
  dataArray: null,
  server: null,
  respondImmediately: true,
  errorMessageIndex: -1,

  mock(dataArray, columns, delay = 0) {
    this.shutdown();
    this.set('type', 'mockAPI');
    this.set('dataArray', dataArray);
    this.set('server', mockAPI(columns, delay));
    this.set('respondImmediately', true);
    this.set('errorMessageIndex', -1);
  },

  sendFailMessageAt(index) {
    let dataArray = this.dataArray;
    if (isEmpty(dataArray) || dataArray.length <= index) {
      return;
    }
    this.set('errorMessageIndex', index);
  },

  fail(columns) {
    this.shutdown();
    this.set('type', 'failAPI');
    this.set('server', failAPI(columns));
  },

  shutdown() {
    let server = this.server;
    if (server) {
      server.shutdown();
    }
  },

  connect(_, onStompConnect, onStompError) {
    if (isEqual(this.type, 'mockAPI')) {
      onStompConnect();
    } else {
      onStompError();
    }
  },

  subscribe(_, onStompMessage) {
    this.set('onStompMessage', onStompMessage);
  },

  getResponseType(index, totalMessages, errorMessageIndex) {
    if (isEqual(index, errorMessageIndex)) {
      return 'FAIL';
    }
    return isEqual(index, totalMessages - 1) ? 'COMPLETE' : 'MESSAGE';
  },

  respondWithData() {
    let onStompMessage = this.onStompMessage;
    let dataArray = this.dataArray;
    if (onStompMessage && !isEmpty(dataArray)) {
      let length = dataArray.length;
      let errorMessageIndex = this.errorMessageIndex;
      dataArray.forEach((data, i) => {
        let responseType = this.getResponseType(i, length, errorMessageIndex);
        let response = {
          body: JSON.stringify({
            type: responseType,
            content: JSON.stringify(data)
          })
        };
        onStompMessage(response);
      });
    }
  },

  send() {
    if (this.respondImmediately) {
      this.respondWithData();
    }
  },

  disconnect() { }
});

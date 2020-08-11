/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual, isEmpty } from '@ember/utils';
import { mockAPI, failAPI } from 'bullet-ui/tests/helpers/pretender';
import { next } from '@ember/runloop';

export default class MockedAPI {
  type = null;
  dataArray = null;
  server = null;
  errorMessageIndex = -1;

  mock(dataArray, columns, delay = 0) {
    this.shutdown();
    this.type = 'mockAPI';
    this.dataArray = dataArray;
    this.server = mockAPI(columns, delay);
    this.errorMessageIndex = -1;
  }

  sendFailMessageAt(index) {
    let dataArray = this.dataArray;
    if (isEmpty(dataArray) || dataArray.length <= index) {
      return;
    }
    this.errorMessageIndex = index;
  }

  fail(columns) {
    this.shutdown();
    this.type = 'failAPI';
    this.server = failAPI(columns);
  }

  shutdown() {
    let server = this.server;
    if (server) {
      server.shutdown();
    }
  }

  connect(_, onStompConnect, onStompError) {
    if (isEqual(this.type, 'mockAPI')) {
      onStompConnect();
    } else {
      onStompError();
    }
  }

  subscribe(_, onStompMessage) {
    this.onStompMessage = onStompMessage;
  }

  getResponseType(index, totalMessages, errorMessageIndex) {
    if (isEqual(index, errorMessageIndex)) {
      return 'FAIL';
    }
    return isEqual(index, totalMessages - 1) ? 'COMPLETE' : 'MESSAGE';
  }

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
  }

  send() {
    // IMPORTANT: Run in the next run loop since otherwise a segment will be added before we navigate to the result and
    // cause the segment save to race the result add (can wipe attributes (most importantly the query) on the result)
    next(() => {
      this.respondWithData();
    })
  }

  disconnect() { }
}

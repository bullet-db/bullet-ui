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

  mock(dataArray, columns, delay = 0) {
    this.shutdown();
    this.set('type', 'mockAPI');
    this.set('dataArray', dataArray);
    this.set('server', mockAPI(columns, delay));
  },

  fail(columns) {
    this.shutdown();
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
    if (isEqual(this.get('type'), 'mockAPI')) {
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
    if (onStompMessage && !isEmpty(dataArray)) {
      let length = dataArray.length;
      dataArray.forEach((data, i) => {
        let responseType = isEqual(i, length - 1) ? 'COMPLETE' : 'MESSAGE';
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

  disconnect() {}
});

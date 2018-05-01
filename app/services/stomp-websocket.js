/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';
import { computed } from '@ember/object';
import Service from '@ember/service';
import SockJS from 'npm:sockjs-client';
import Stomp from 'npm:@stomp/stompjs';

const ACK_TYPE = 'ACK';
const COMPLETE_TYPE = 'COMPLETE';
const NEW_QUERY_TYPE = 'NEW_QUERY';
const SESSION_LENGTH = 64;

export default Service.extend({
  url: computed('settings', function() {
    return `${this.get('settings.queryHost')}/${this.get('settings.queryNamespace')}/${this.get('settings.queryPath')}`;
  }),

  queryStompRequestChannel: computed('settings', function() {
    return this.get('settings.queryStompRequestChannel');
  }),

  queryStompResponseChannel: computed('settings', function() {
    return this.get('settings.queryStompResponseChannel');
  }),

  makeStompMessageHandler(stompClient, successHandler, context) {
    return payload => {
      let message = JSON.parse(payload.body);
      if (!isEqual(message.type, ACK_TYPE)) {
        if (isEqual(message.type, COMPLETE_TYPE)) {
          stompClient.disconnect();
        }
        successHandler(JSON.parse(message.content), context);
      }
    };
  },

  makeStompConnectHandler(stompClient, data, onStompMessage) {
    let queryStompRequestChannel = this.get('queryStompRequestChannel');
    let queryStompResponseChannel = this.get('queryStompResponseChannel');
    return () => {
      stompClient.subscribe(queryStompResponseChannel, onStompMessage);
      let request = {
        content: JSON.stringify(data),
        type: NEW_QUERY_TYPE
      };
      stompClient.send(queryStompRequestChannel, { }, JSON.stringify(request));
    };
  },

  makeStompErrorHandler(errorHandler, context) {
    return (...args) => {
      errorHandler(`Error when connecting the server: ${args}`, context);
    };
  },

  createStompClient(data, successHandler, errorHandler, context) {
    let url = this.get('url');
    let ws = new SockJS(url, [], { sessionId: SESSION_LENGTH });
    let stompClient = Stomp.over(ws);
    stompClient.debug = null;

    let onStompMessage = this.makeStompMessageHandler(stompClient, successHandler, context);
    let onStompConnect = this.makeStompConnectHandler(stompClient, data, onStompMessage);
    let onStompError = this.makeStompErrorHandler(errorHandler, context);
    stompClient.connect({ }, onStompConnect, onStompError);
    return stompClient;
  }
});

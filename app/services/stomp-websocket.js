/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';
import { computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import SockJS from 'npm:sockjs-client';
import Stomp from 'npm:@stomp/stompjs';

const ACK_TYPE = 'ACK';
const COMPLETE_TYPE = 'COMPLETE';
const NEW_QUERY_TYPE = 'NEW_QUERY';
const SESSION_LENGTH = 64;

export default Service.extend({
  querier: service(),

  url: computed('settings', function() {
    return `${this.get('settings.queryHost')}/${this.get('settings.queryNamespace')}/${this.get('settings.queryPath')}`;
  }),

  queryStompRequestChannel: computed('settings', function() {
    return this.get('settings.queryStompRequestChannel');
  }),

  queryStompResponseChannel: computed('settings', function() {
    return this.get('settings.queryStompResponseChannel');
  }),

  makeStompMessageHandler(stompClient, handlers, context) {
    return payload => {
      let { type, content } = JSON.parse(payload.body);
      if (!isEqual(type, ACK_TYPE)) {
        if (isEqual(type, COMPLETE_TYPE)) {
          this.get('querier').cancel();
        }
        handlers.message(JSON.parse(content), context);
      }
    };
  },

  makeStompConnectHandler(stompClient, data, handlers, context) {
    let queryStompRequestChannel = this.get('queryStompRequestChannel');
    let queryStompResponseChannel = this.get('queryStompResponseChannel');
    let onStompMessage = this.makeStompMessageHandler(stompClient, handlers, context);
    return () => {
      stompClient.subscribe(queryStompResponseChannel, onStompMessage);
      let request = {
        content: JSON.stringify(data),
        type: NEW_QUERY_TYPE
      };
      stompClient.send(queryStompRequestChannel, { }, JSON.stringify(request));
      handlers.success(context);
    };
  },

  makeStompErrorHandler(handlers, context) {
    return (...args) => {
      handlers.error(`Error while communicating with the server: ${args}`, context);
      // TODO: Redirect to an error page
    };
  },

  createStompClient(data, handlers, context) {
    let url = this.get('url');
    let ws = new SockJS(url, [], { sessionId: SESSION_LENGTH });
    let stompClient = Stomp.over(ws);
    stompClient.debug = null;

    let onStompConnect = this.makeStompConnectHandler(stompClient, data, handlers, context);
    let onStompError = this.makeStompErrorHandler(handlers, context);
    stompClient.connect({ }, onStompConnect, onStompError);
    return stompClient;
  }
});

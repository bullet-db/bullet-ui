/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';

export default class QuerierService extends Service {
  @service stompWebsocket;
  @alias('stompWebsocket.isConnected') isRunningQuery;

  send(data, handlers, context) {
    this.stompWebsocket.startStompClient(data, handlers, context);
  }

  cancel() {
    this.stompWebsocket.disconnect();
  }
}

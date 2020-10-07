/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { alias } from '@ember/object/computed';
import { typeOf } from '@ember/utils';
import Service, { inject as service } from '@ember/service';
import QueryConverter from 'bullet-ui/utils/query-converter';

export default class QuerierService extends Service {
  @service stompWebsocket;
  @alias('stompWebsocket.isConnected') isRunningQuery;

  send(query, handlers, context) {
    let data = query;
    if (typeOf(query) !== 'string') {
      data = QueryConverter.createBQL(query);
    }
    this.stompWebsocket.startStompClient(data, handlers, context);
  }

  cancel() {
    this.stompWebsocket.disconnect();
  }
}

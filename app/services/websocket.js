/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Service.extend({
  createStompClient() {
    let ws = new SockJS(...arguments);
    let client = Stomp.over(ws);
    client.debug = null;
    return client;
  }
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';
import QueryConverter from 'bullet-ui/utils/query-converter';
import { AGGREGATION_TYPES } from 'bullet-ui/utils/query-constants';

export default class QuerierService extends Service {
  @service stompWebsocket;
  @alias('stompWebsocket.isConnected') isRunningQuery;

  get defaultAggregation() {
    return {
      type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW),
      size: 1
    };
  }

  /**
   * Converts an internal Ember Bullet query to the API query specification.
   * @param {Object} query An Ember Data object representing the query.
   * @return {Object} The API Bullet query.
   */
  reformat(query) {
    return QueryConverter.createBQL(query);
  }

  /**
   * Recreates a Ember Data like representation from an API query specification.
   * @param {Object} bql The API Bullet query.
   * @return {Object} An Ember Object that looks like the Ember Data representation.
   */
  recreate(bql) {
    return QueryConverter.recreateQuery(bql);
  }

  send(data, handlers, context) {
    this.stompWebsocket.startStompClient(this.reformat(data), handlers, context);
  }

  cancel() {
    this.stompWebsocket.disconnect();
  }
}

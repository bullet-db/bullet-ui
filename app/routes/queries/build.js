/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { inject as service } from '@ember/service';
import DefaultQueryRoute from 'bullet-ui/routes/queries/default-query';
import QueryConverter from 'bullet-ui/utils/query-converter';
import { AGGREGATION_TYPES } from 'bullet-ui/utils/query-constants';

const DEFAULT_AGGREGATION = {
  type: AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW),
  size: 1
};

export default class QueriesBuildRoute extends DefaultQueryRoute {
  @service queryManager;
  @service store;

  async beforeModel() {
    let query = await this.addDefaultQuery();
    query = await query.save();
    this.transitionTo('query', query.get('id'));
  }

  async createQuery(query) {
    try {
      let queryObject = QueryConverter.recreateQuery(query);
      let copy = await this.queryManager.copyQuery(queryObject);
      return this.queryManager.addBQL(copy);
    } catch (errors) {
      return this.createEmptyQuery();
    }
  }

  async createEmptyQuery() {
    let aggregation = this.store.createRecord('aggregation', DEFAULT_AGGREGATION);
    await aggregation.save();
    let query = this.store.createRecord('query', { aggregation: aggregation });
    return this.queryManager.addBQL(query);
  }
}

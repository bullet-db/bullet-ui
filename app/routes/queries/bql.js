/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { inject as service } from '@ember/service';
import DefaultQueryRoute from 'bullet-ui/routes/queries/default-query';

const DEFAULT_QUERY = 'SELECT * FROM STREAM(20000, TIME) LIMIT 1 ;';

export default class QueriesBqlRoute extends DefaultQueryRoute {
  @service queryManager;
  @service store;

  async beforeModel() {
    let query = await this.addDefaultQuery();
    query = await query.save();
    this.transitionTo('bql', query.get('id'));
  }

  async createQuery(query) {
    return this.store.createRecord('bql', { query: query });
  }

  async createEmptyQuery() {
    return this.createQuery(DEFAULT_QUERY);
  }
}

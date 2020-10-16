/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import QueryableRoute from 'bullet-ui/routes/queryable';

export default class BqlRoute extends QueryableRoute {
  @service queryManager;
  @service store;

  get isDirty() {
    return this.controller.get('changeset.isDirty');
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('changeset', model.query);
  }

  async model(params) {
    let model = { };
    let query = await this.store.findRecord('bql', params.query_id);
    model.query = this.queryManager.createChangeset(query, 'bql');
    model.schema = await this.store.findAll('column');
    return model;
  }

  @action
  async saveQuery() {
    if (this.isDirty) {
      let changeset = this.controller.get('changeset');
      await changeset.save();
    }
  }

  @action
  async sendQuery() {
    let id = this.paramsFor('bql').query_id;
    let result = await this.queryManager.addResult(id);
    this.submitQuery(this.controller.get('changeset.query'), result);
  }
}

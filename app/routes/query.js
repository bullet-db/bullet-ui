/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { all, resolve } from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { isEmpty, isNone, typeOf } from '@ember/utils';
import Route from '@ember/routing/route';
import QueryableRoute from 'bullet-ui/routes/queryable-route';

export default class QueryRoute extends QueryableRoute {
  @service querier;
  @service queryManager;
  @service store;

  get areChangesetsDirty() {
    if (this.controller.get('forcedDirty')) {
      return true;
    }
    let changesets = Object.values(this.controller.get('changesets'));
    for (const value of changesets) {
      if (typeOf(value) === 'array' ? value.isAny('isDirty') : value.get('isDirty')) {
        return true;
      }
    }
    return false;
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('changesets', model);
    controller.set('forcedDirty', false);
  }

  async model(params) {
    let models = await this.getModels(params.query_id);
    let changesets = await this.createChangesets(models);
    // No changeset for schema
    changesets.schema = await this.store.findAll('column');
    return changesets;
  }

  async getModels(queryID) {
    let models = { };
    models.query = await this.store.findRecord('query', queryID);
    models.projections = await models.query.projections;
    models.aggregation = await models.query.aggregation;
    models.groups = await models.aggregation.groups;
    models.metrics = await models.aggregation.metrics;
    models.filter = await models.query.filter;
    models.window = await models.query.window;
    return models;
  }

  async createChangesets(models) {
    let changesets = { };
    // Always present so no need to copy. Just changeset it
    changesets.query = this.queryManager.createChangeset(models.query, 'query');
    changesets.aggregation = this.queryManager.createChangeset(models.aggregation, 'aggregation');
    // Optional singles
    changesets.filter = await this.createChangesetAsArray(models.filter, 'filter', ['clause', 'summary']);
    changesets.window = await this.createChangesetAsArray(models.window, 'window', ['emitType', 'emitEvery', 'includeType']);
    // Optional multiple
    changesets.projections = await this.createFieldLikeChangesets(models.projections, 'projection');
    changesets.groups = await this.createFieldLikeChangesets(models.groups, 'group');
    changesets.metrics = await this.createFieldLikeChangesets(models.metrics, 'metric', ['type', 'field', 'name']);
    return changesets;
  }

  async createChangesetAsArray(model, modelName, fields) {
    // Wrapping the model into an array to handle: no model -> new model created from the form. Also need to copy it
    // for: model -> deleting it from the form. This shouldn't delete the original model.
    let array = A();
    if (!isNone(model)) {
      let copy = await this.queryManager.copyModelAndFields(model, modelName, fields);
      array.pushObject(this.queryManager.createChangeset(copy, modelName));
    }
    return array;
  }

  // Using rsvp promises since await inside a forEach is messy
  createFieldLikeChangesets(collection, modelName, fields = ['field', 'name']) {
    if (isEmpty(collection)) {
      return A();
    }
    // Copy the models since we don't want to edit any original field-like hasManys when working on the query
    let promises = collection.map(model => this.queryManager.copyModelAndFields(model, modelName, fields));
    return all(promises).then(results => {
      let changesets = A();
      results.forEach(result => changesets.pushObject(this.queryManager.createChangeset(result, modelName)));
      return resolve(changesets);
    });
  }

  @action
  forceDirty() {
    this.controller.set('forcedDirty', true);
  }

  @action
  async saveQuery() {
    if (!this.areChangesetsDirty) {
      return;
    }
    let changesets = this.controller.get('changesets');
    await this.queryManager.save({
      query: changesets.query, aggregation: changesets.aggregation,
      filter: changesets.filter.objectAt(0), window: changesets.window.objectAt(0),
      projections: changesets.projections, metrics: changesets.metrics, groups: changesets.groups
    });
    this.controller.set('forcedDirty', false);
  }

  @action
  fireQuery() {
    this.queryManager.addResult(this.paramsFor('query').query_id).then(result => {
      this.store.findRecord('query', this.paramsFor('query').query_id).then(query => {
        this.submitQuery(query, result, this);
      });
    });
  }

  @action
  willTransition(transition) {
    // If dirty and the user clicked no (hence negated), abort. Else if not dirty or user clicked yes, throw away copies.
    if (this.areChangesetsDirty && !confirm('You have changes that may be lost unless you save! Are you sure?')) {
      transition.abort();
    } else {
      // If the user url navigates away or closes the browser, these copied models will be cleaned up on queries load.
      return true;
    }
  }
}

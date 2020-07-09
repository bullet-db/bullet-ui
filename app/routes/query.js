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
    if (this.controller.get('forceDirty')) {
      return true;
    }
    let changesets = Object.values(this.controller.get('changesets'));
    for (const value of changesets) {
      // If array (EmberArray), is anything dirty? Otherwise, is the value dirty?
      if (typeOf(value) === 'array' ? value.isAny('isDirty') : value.get('isDirty')) {
        return true;
      }
    }
    return false;
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('changesets', model);
    controller.set('forceDirty', false);
  }

  async model(params) {
    let models = { };
    models.schema = await this.store.findAll('column');
    models.query = await this.store.findRecord('query', params.query_id);
    models.projections = await models.query.projections;
    models.aggregation = await models.query.aggregation;
    models.groups = await models.aggregation.groups;
    models.metrics = await models.aggregation.metrics;
    models.filter = await models.query.filter;
    models.window = await models.query.window;

    let changesets = await this.createChangesets(models);
    // No changeset for schema
    changesets.schema = models.schema;
    return changesets;
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

  deleteModels(collection) {
    collection.forEach(item => {
      this.queryManager.deleteModel(item.get('data'));
    });
  }

  discardChangesets() {
    // Just toss away query and aggregation. Nothing to do. Wipe everything else.
    let { filter, window, projections, groups, metrics } = this.controller.get('changesets');
    this.deleteModels(filter);
    this.deleteModels(window);
    this.deleteModels(projections);
    this.deleteModels(groups);
    this.deleteModels(metrics);
  }

  async applyChangesets() {
  }

  @action
  forceDirty() {
    this.controller.set('forceDirty', true);
  }

  @action
  async saveQuery() {
    if (this.areChangesetsDirty) {
      // this.controller.set('forceDirty', false);
      await this.applyChangesets();
    }
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
      this.discardChangesets();
      return true;
    }
  }
}

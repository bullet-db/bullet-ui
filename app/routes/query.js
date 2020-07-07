/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { all, resolve, reject } from 'rsvp';
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
  }

  async model(params) {
    let models = { };
    models.schema = await this.store.findAll('column');
    models.query = await this.store.findRecord('query', params.query_id);
    models.filter = await models.query.filter;
    models.projections = await models.query.projections;
    models.window = await models.query.window;
    models.aggregation = await models.query.aggregation;
    models.groups = await models.aggregation.groups;
    models.metrics = await models.aggregation.metrics;

    let modelChangesets = await this.createChangesets(models);
    // No changesets for filters and schema!
    modelChangesets.filter = models.filter;
    modelChangesets.schema = models.schema;
    return modelChangesets;
  }

  async createChangesets(models) {
    let changesets = { };
    changesets.query = this.queryManager.createChangeset(models.query, 'query');
    changesets.aggregation = this.queryManager.createChangeset(models.aggregation, 'aggregation');
    // Wrapping the window into an array so that any new windows created from the form can be added to it
    changesets.window = isNone(models.window) ? A() : A([this.queryManager.createChangeset(models.window, 'window')]);
    changesets.projections = await this.createFieldLikeChangesets(models.projections, 'projection');
    changesets.groups = await this.createFieldLikeChangesets(models.groups, 'group');
    changesets.metrics = await this.createFieldLikeChangesets(models.metrics, 'metric', ['type', 'field', 'name']);
    return changesets;
  }

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
  willTransition(transition) {
    if (this.areChangesetsDirty && !confirm('You have made changes! Are you sure you want to navigate away?')) {
      transition.abort();
    } else {
      return true;
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
}

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
// Validations
import QueryValidations from 'bullet-ui/validators/query';
import ProjectionValidations from 'bullet-ui/validators/projection';
import AggregationValidations from 'bullet-ui/validators/aggregation';
import GroupValidations from 'bullet-ui/validators/group';
import MetricValidations from 'bullet-ui/validators/metric';
import WindowValidations from 'bullet-ui/validators/window';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';

export default class QueryRoute extends QueryableRoute {
  @service querier;
  @service queryManager;
  @service store;

  get areChangesetsDirty() {
    let changesets = this.controller.get('changesets');
    let isDirty = false;
    for (const value of Object.values(changesets)) {
      if (typeOf(value) !== 'array') {
        isDirty = isDirty || value.get('isDirty');
      } else {
        values.forEach(v => {
          isDirty = isDirty || v.get('isDirty');
        });
      }
      if (isDirty) {
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
    // No changeset!
    modelChangesets.filter = models.filter;
    modelChangesets.schema = models.schema;
    return modelChangesets;
  }

  async createChangesets(models) {
    let changesets = { };
    changesets.query = this.createChangeset(models.query, QueryValidations);
    changesets.aggregation = this.createChangeset(models.aggregation, AggregationValidations);
    // Wrapped into an array
    changesets.window = isNone(models.window) ? A() : A([this.createChangeset(models.window, WindowValidations)]);
    changesets.projections = await this.createFieldLikeChangesets(models.projections, 'projection', ProjectionValidations);
    changesets.groups = await this.createFieldLikeChangesets(models.groups, 'group', GroupValidations);
    changesets.metrics = await this.createFieldLikeChangesets(models.metrics, 'metric', MetricValidations, ['type', 'field', 'name']);
    return changesets;
  }

  createChangeset(model, validations) {
    return new Changeset(model, lookupValidator(validations), validations);
  }

  createFieldLikeChangesets(collection, modelName, validations, fields = ['field', 'name']) {
    if (isEmpty(collection)) {
      return A();
    }
    // Copy the models since we don't want to edit any original field-like hasManys when working on the query
    let promises = collection.map(model => this.queryManager.copyModelAndFields(model, modelName, fields));
    return all(promises).then(results => {
      let changesets = A();
      results.forEach(result => changesets.pushObject(this.createChangeset(result, validations)));
      return resolve(changesets);
    });
  }

  @action
  wipeFieldLikes(collectionName) {
    let changesets = this.controllerFor('query').get('changesets');
  }

  @action
  addFieldLike(collectionName, modelName) {
  }

  @action
  willTransition(transition) {
    if (!this.areChangesetsDirty && !confirm('You have made changes! Are you sure you want to navigate away?')) {
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

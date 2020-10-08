/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class BqlRoute extends Route {
  @service querier;
  @service queryManager;
  @service store;

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

  submitQuery(query, result) {
    let handlers = {
      success(route) {
        route.transitionTo('result', route.savedResult.get('id'));
      },
      error(error, route) {
        console.error(error); // eslint-disable-line no-console
        route.transitionTo('errored');
      },
      message(message, route) {
        route.queryManager.addSegment(route.savedResult, message);
      }
    };
    // Needs to be on the route not the controller since it gets wiped and controller is changed once we transition
    this.savedResult = result;
    this.querier.send(query, handlers, this);
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
  async sendQuery() {
    let id = this.paramsFor('query').query_id;
    let result = await this.queryManager.addResult(id);
    let query = await this.store.findRecord('query', id);
    this.submitQuery(query, result);
  }

  @action
  willTransition(transition) {
    // If dirty and the user clicked no (hence negated), abort. Else if not dirty or user clicked yes, bubble.
    let isDirty = this.controller.get('changeset.isDirty');
    if (isDirty && !confirm('You have changes that may be lost unless you save! Are you sure?')) {
      transition.abort();
    } else {
      return true;
    }
  }

  @action
  error() {
    this.replaceWith('missing', 'not-found');
  }
}

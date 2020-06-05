/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Route from '@ember/routing/route';
import { get } from '@ember/object';

/**
 * This class just stores some shared handler logic for routes that need to interact with queries and results.
 */
export default class QueryableRoute extends Route {
  resultHandler(route) {
    route.transitionTo('result', get(route.savedResult, 'id'));
  }

  errorHandler(error, route) {
    console.error(error); // eslint-disable-line no-console
    route.transitionTo('errored');
  }

  windowHandler(message, route) {
    route.queryManager.addSegment(route.savedResult, message);
  }

  submitQuery(query, result, route) {
    let handlers = {
      success: this.resultHandler,
      error: this.errorHandler,
      message: this.windowHandler
    };
    route.savedResult = result;
    route.querier.send(query, handlers, route);
  }

  lateSubmitQuery(query, route) {
    let handlers = {
      success: () => { },
      error: this.errorHandler,
      message: this.windowHandler
    };
    // savedResult already exists and points to result
    route.querier.send(query, handlers, route);
  }
}

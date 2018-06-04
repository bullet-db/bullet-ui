/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  resultHandler(routeContext) {
    routeContext.transitionTo('result', routeContext.get('savedResult.id'));
  },

  errorHandler(error, routeContext) {
    console.error(error); // eslint-disable-line no-console
    routeContext.transitionTo('errored');
  },

  windowHandler(message, routeContext) {
    routeContext.get('queryManager').addSegment(routeContext.get('savedResult'), message);
  },

  submitQuery(query, result, routeContext) {
    let handlers = {
      success: this.resultHandler,
      error: this.errorHandler,
      message: this.windowHandler
    };
    routeContext.set('savedResult', result);
    routeContext.get('querier').send(query, handlers, routeContext);
  }
});

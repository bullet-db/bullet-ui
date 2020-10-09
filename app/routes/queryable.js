/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isNone, typeOf } from '@ember/utils';
import Route from '@ember/routing/route';

/**
 * Users of this class must implement isDirty()
 */
export default class QueryableRoute extends Route {
  @service querier;

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
  willTransition(transition) {
    // If dirty and the user clicked no (hence negated), abort. Else if not dirty or user clicked yes, bubble.
    if (this.isDirty && !confirm('You have changes that may be lost unless you save! Are you sure?')) {
      transition.abort();
    } else {
      // If the user url navigates away or closes the browser, these copied models will be cleaned up on queries load.
      return true;
    }
  }

  @action
  error() {
    this.replaceWith('missing', 'not-found');
  }
}

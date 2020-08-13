/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SchemaRoute extends Route {
  @service store;

  model() {
    return this.store.findAll('column');
  }
}

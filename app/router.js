/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('queries', function() {
    this.route('new');
  });
  this.route('query', { path: 'query/:query_id' });

  this.route('create', { path: 'create/:hash' });

  this.route('result', { path: 'result/:result_id' });

  this.route('errored');
  this.route('missing', { path: '*path' });
  this.route('schema');
});

export default Router;

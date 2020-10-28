/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberRouter from '@ember/routing/router';
import config from 'bullet-ui/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('queries', function() {
    this.route('build');
    this.route('bql');
  });
  this.route('query', { path: 'query/:query_id' });
  this.route('bql', { path: 'bql/:query_id' });

  this.route('create', { path: 'create/:hash' });

  this.route('result', { path: 'result/:result_id' });

  this.route('errored');
  this.route('missing', { path: '/*' });
  this.route('schema');
});

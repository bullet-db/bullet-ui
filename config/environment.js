/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
module.exports = function(environment) {
  var configuration = require('./host-settings.json');
  var ENV = {
    modulePrefix: 'bullet-ui',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      // Need this to make csv iteration simpler
      EXTEND_PROTOTYPES: {
        Array: false
      },
      FEATURES: {
        // Here you can enable experimental features on an ember canary build e.g. 'with-controller': true
      }
    },
    APP: {
      // Inject default static settings
      SETTINGS: configuration.default
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
  }
  return ENV;
};

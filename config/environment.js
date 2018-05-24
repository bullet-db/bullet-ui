/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

/* eslint-env node */


const INTERNAL_APP_SETTINGS = {
  adapter: 'indexeddb'
}

const TEST_SETTINGS = {
  queryHost: 'https://foo.bar.com:4443',
  queryNamespace: 'bullet/api',
  queryPath: 'drpc',
  queryStompRequestChannel: '/server/request',
  queryStompResponseChannel: '/client/response',
  schemaHost: 'https://foo.bar.com:4443',
  schemaNamespace: 'bullet/api',
  helpLinks: [
    {
      name: 'Tutorials',
      link: 'https://yahoo.github.io/bullet-docs/ui/usage'
    }
  ],
  bugLink: 'https://github.com/yahoo/bullet-ui/issues',
  modelVersion: 2,
  migrations: {
    deletions: 'none'
  },
  adapter: 'local',
  defaultValues: {
    aggregationMaxSize: 512,
    rawMaxSize: 100,
    durationMaxSecs: 120,
    distributionNumberOfPoints: 11,
    distributionQuantilePoints: '0, 0.25, 0.5, 0.75, 0.9, 1',
    distributionQuantileStart: 0,
    distributionQuantileEnd: 1,
    distributionQuantileIncrement: 0.1,
    queryTimeoutSecs: 3,
    windowEmitFrequencyMinSecs: 1,
    everyForRecordBasedWindow: 1,
    everyForTimeBasedWindow: 2,
    sketches: {
      countDistinctMaxEntries: 16384,
      groupByMaxEntries: 512,
      distributionMaxEntries: 1024,
      distributionMaxNumberOfPoints: 100,
      topKMaxEntries: 1024,
      topKErrorType: 'No False Negatives'
    },
    metadataKeyMapping: {
      querySection: 'Query',
      windowSection: 'Window',
      sketchSection: 'Sketch',
      theta: 'Theta',
      uniquesEstimate: 'Uniques Estimate',
      queryCreationTime: 'Receive Time',
      queryTerminationTime: 'Finish Time',
      estimatedResult: 'Was Estimated',
      standardDeviations: 'Standard Deviations',
      normalizedRankError: 'Normalized Rank Error',
      maximumCountError: 'Maximum Count Error',
      itemsSeen: 'Items Seen',
      minimumValue: 'Minimum Value',
      maximumValue: 'Maximum Value',
      windowNumber: 'Number',
      windowSize: 'Size',
      expectedEmitTime: 'Expected Emit Time'
    }
  }
}

module.exports = function(environment) {
  let configuration = require('./env-settings.json');
  let ENV = {
    modulePrefix: 'bullet-ui',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        Array: false,
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Inject default static settings
      SETTINGS: Object.assign({ }, INTERNAL_APP_SETTINGS, configuration.default)
      // Here you can pass flags/options to your application instance
      // when it is created
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
    ENV.locationType = 'none';

    // Override settings with fixed settings
    ENV.APP.SETTINGS = TEST_SETTINGS;

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // Add overrides here.
  }
  return ENV;
};

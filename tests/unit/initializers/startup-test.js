/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import StartupInitializer from 'bullet-ui/initializers/startup';
import { module, test } from 'qunit';
import ENV from 'bullet-ui/config/environment';

let application;

module('Unit | Initializer | startup', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
      StartupInitializer.initialize(application);
    });
  }
});

test('it can deep merge settings', function(assert) {
  let overrides = {
    modelVersion: 10,
    helpLinks: [{ name: 'foo', link: 'http://foo.bar.com' }],
    migrations: { deletions: 'query' },
    defaultValues: {
      aggregationMaxSize: 200,
      sketches: { countDistinctMaxEntries: 10 },
      metadataKeyMapping: { theta: 'foo', foo: 'bar' }
    }
  };
  let merged = StartupInitializer.deepMergeSettings(overrides);

  let expected = JSON.parse(JSON.stringify(ENV.APP.SETTINGS));
  expected.modelVersion = 10;
  expected.helpLinks = [
    { name: 'Tutorials', link: 'https://yahoo.github.io/bullet-docs/ui/usage' },
    { name: 'foo', link: 'http://foo.bar.com' }
  ];
  expected.migrations.deletions =  'query';
  expected.defaultValues.aggregationMaxSize = 200;
  expected.defaultValues.sketches.countDistinctMaxEntries = 10;
  expected.defaultValues.metadataKeyMapping.theta = 'foo';
  expected.defaultValues.metadataKeyMapping.foo = 'bar';

  assert.deepEqual(merged, expected);
});

test('it registers the settings factory', function(assert) {
  assert.ok(application.hasRegistration('settings:main'));
});

test('the application has the settings injected', function(assert) {
  let instance = application.buildInstance();
  let settings = instance.lookup('settings:main');
  assert.notOk(Ember.isEmpty(settings));
  assert.notOk(Ember.isBlank(settings.get('queryNamespace')));
});

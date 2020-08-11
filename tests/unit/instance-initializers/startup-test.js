/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty, isBlank } from '@ember/utils';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import Application from 'bullet-ui/app';
import StartupInitializer from 'bullet-ui/instance-initializers/startup';
import ENV from 'bullet-ui/config/environment';

module('Unit | Instance Initializer | startup', function(hooks) {
  hooks.beforeEach(function() {
    run(() => {
      this.application = Application.create({ autoboot: false });
      this.appInstance = this.application.buildInstance();
    });
  });

  hooks.afterEach(function() {
    run(this.appInstance, 'destroy');
    run(this.application, 'destroy');
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
    expected.migrations.deletions = 'query';
    expected.defaultValues.aggregationMaxSize = 200;
    expected.defaultValues.sketches.countDistinctMaxEntries = 10;
    expected.defaultValues.metadataKeyMapping.theta = 'foo';
    expected.defaultValues.metadataKeyMapping.foo = 'bar';

    assert.deepEqual(merged, expected);
  });

  test('it can deep merge empty help links', function(assert) {
    let overrides = { };
    let merged = StartupInitializer.deepMergeSettings(overrides);

    let expected = JSON.parse(JSON.stringify(ENV.APP.SETTINGS));
    expected.helpLinks = [
      { name: 'Tutorials', link: 'https://yahoo.github.io/bullet-docs/ui/usage' }
    ];
    expected.defaultValues.aggregationMaxSize = 512;

    assert.deepEqual(merged, expected);
  });

  test('it can deep merge duplicate help links', function(assert) {
    let overrides = {
      helpLinks: [
        { name: 'Tutorials', link: 'https://yahoo.github.io/bullet-docs/ui/usage' },
        { name: 'foo', link: 'http://foo.bar.com' }
      ]
    };
    let merged = StartupInitializer.deepMergeSettings(overrides);

    let expected = JSON.parse(JSON.stringify(ENV.APP.SETTINGS));
    expected.helpLinks = [
      { name: 'Tutorials', link: 'https://yahoo.github.io/bullet-docs/ui/usage' },
      { name: 'foo', link: 'http://foo.bar.com' }
    ];
    expected.defaultValues.aggregationMaxSize = 512;

    assert.deepEqual(merged, expected);
  });

  test('it registers the settings factory', async function(assert) {
    await this.appInstance.boot();
    assert.ok(this.appInstance.hasRegistration('settings:main'));
  });

  test('the application instance has the settings injected', async function(assert) {
    await this.appInstance.boot();
    let settings = this.appInstance.lookup('settings:main');
    assert.notOk(isEmpty(settings));
    assert.notOk(isBlank(settings.get('queryNamespace')));
  });
});

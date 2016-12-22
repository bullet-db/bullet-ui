/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import StartupInitializer from 'bullet-ui/initializers/startup';
import { module, test } from 'qunit';

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

test('it registers the settings factory', function(assert) {
  assert.ok(application.hasRegistration('settings:main'));
});

test('the application has the settings injected', function(assert) {
  let instance = application.buildInstance();
  let settings = instance.lookup('settings:main');
  assert.notOk(Ember.isEmpty(settings));
  assert.notOk(Ember.isBlank(settings.get('drpcNamespace')));
});

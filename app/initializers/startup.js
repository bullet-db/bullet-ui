/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import ENV from 'bullet-ui/config/environment';

export default {
  name: 'settings',

  initialize(application) {
    let metaSettings = Ember.$('head meta[name=app-settings]').attr('content');
    let decodedSettings = { };
    if (metaSettings) {
      decodedSettings = JSON.parse(decodeURIComponent(metaSettings));
    }
    // Merge into default settings, overriding them
    let settings = this.deepMergeSettings(decodedSettings);

    application.register('settings:main', Ember.Object.create(settings), { instantiate: false });
    application.inject('service', 'settings', 'settings:main');
    application.inject('adapter', 'settings', 'settings:main');
    application.inject('route', 'settings', 'settings:main');
    application.inject('model', 'settings', 'settings:main');
    application.inject('controller', 'settings', 'settings:main');
    application.inject('component', 'settings', 'settings:main');
  },

  deepMergeSettings(overrides) {
    let settings = JSON.parse(JSON.stringify(ENV.APP.SETTINGS));
    Ember.$.extend(true, settings, overrides);

    // Handle arrays manually
    let helpLinks = [];
    Ember.$.merge(helpLinks, ENV.APP.SETTINGS.helpLinks || []);
    Ember.$.merge(helpLinks, overrides.helpLinks || []);
    settings.helpLinks = helpLinks;
    return settings;
  }
};

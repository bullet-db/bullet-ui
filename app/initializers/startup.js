/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import $ from 'jquery';
import ENV from 'bullet-ui/config/environment';

export default {
  name: 'settings',

  initialize(application) {
    let metaSettings = $('head meta[name=app-settings]').attr('content');
    let decodedSettings = { };
    if (metaSettings) {
      decodedSettings = JSON.parse(decodeURIComponent(metaSettings));
    }
    // Merge into default settings, overriding them
    let settings = this.deepMergeSettings(decodedSettings);

    application.register('settings:main', EmberObject.create(settings), { instantiate: false });
    application.inject('service', 'settings', 'settings:main');
    application.inject('adapter', 'settings', 'settings:main');
    application.inject('route', 'settings', 'settings:main');
    application.inject('model', 'settings', 'settings:main');
    application.inject('controller', 'settings', 'settings:main');
    application.inject('component', 'settings', 'settings:main');
  },

  deepMergeSettings(overrides) {
    let settings = JSON.parse(JSON.stringify(ENV.APP.SETTINGS));
    $.extend(true, settings, overrides);
    // Handle help links manually
    settings.helpLinks = this.getHelpLinks(ENV.APP.SETTINGS.helpLinks, overrides.helpLinks);
    return settings;
  },

  getHelpLinks(originalLinks, overrides) {
    let helpLinks = [];
    $.merge(helpLinks, originalLinks || []);
    let names = new Set();
    originalLinks.forEach(link => names.add(link.name));
    if (overrides) {
      overrides.filter(link => !names.has(link.name)).forEach(link => helpLinks.push(link));
    }
    return helpLinks;
  }
};

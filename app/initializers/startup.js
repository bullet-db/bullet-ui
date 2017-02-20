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
    let settings = { };
    Ember.merge(settings, ENV.APP.SETTINGS);
    Ember.merge(settings, decodedSettings);

    application.register('settings:main', Ember.Object.create(settings), { instantiate: false });
    application.inject('service', 'settings', 'settings:main');
    application.inject('adapter', 'settings', 'settings:main');
    application.inject('route', 'settings', 'settings:main');
    application.inject('controller', 'settings', 'settings:main');
    application.inject('component', 'settings', 'settings:main');

    let version = settings.modelVersion;
    this.applyMigrations(version);
    localStorage.modelVersion = version;
  },

  /**
   * Applies any forced migrations for local storage. Currently, only wipes localStorage
   * if version is greater than the stored version  or if stored version is not present.
   * @param  {Number} version A numeric version to compare the current stored version against.
   * @return {Boolean}        Denoting whether local storage was modified.
   */
  applyMigrations(version) {
    let currentVersion = localStorage.modelVersion;
    if (!currentVersion || version > currentVersion) {
      localStorage.clear();
      return true;
    }
    return false;
  }
};

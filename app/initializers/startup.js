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

    let version = settings.modelVersion;
    application.deferReadiness();
    this.applyMigrations(version).then(() => {
      // Store versions in localStorage explicitly.
      window.localStorage.modelVersion = version;
      application.advanceReadiness();
    });
  },

  /**
   * Applies any forced migrations for the client side storage. Currently, wipes localforage
   * if version is greater than the stored version  or if stored version is not present.
   * @param  {Number} version A numeric version to compare the current stored version against.
   * @return {Promise}        That resolves to a boolean denoting whether the storage was wiped.
   */
  applyMigrations(version) {
    let currentVersion = window.localStorage.modelVersion;
    if (!currentVersion || version > currentVersion) {
      Ember.Logger.info("Wiping of all data requested...Performing wipe");
      return window.localforage.clear().then(() => {
        Ember.Logger.info("Data was wiped.");
        return true;
      });
    }
    return Ember.RSVP.resolve(false);
  }
};

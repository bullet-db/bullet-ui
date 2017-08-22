/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export function initialize(application) {
  let settings = application.lookup('settings:main');
  let migrations = settings.get('migrations');
  let version = settings.get('modelVersion');

  let currentVersion = window.localStorage.modelVersion;
  if (!currentVersion || version > currentVersion) {
    let manager = application.lookup('service:queryManager');
    applyMigrations(manager, migrations);
  }
  window.localStorage.modelVersion = version;
}

/**
 * Applies any forced migrations for local storage.
 * @param  {Object} manager The query manager.
 * @param  {Object} migrations An object containing migrations to apply.
 */
export function applyMigrations(manager, migrations) {
  if (!manager) {
    return;
  }
  let deletions = migrations.deletions;
  // Only support clearing everything or results at the moment
  if (Ember.isEqual(deletions, 'result')) {
    Ember.Logger.log('Deleting all results');
    manager.deleteAllResults();
  } else if (Ember.isEqual(deletions, 'query')) {
    Ember.Logger.log('Deleting all queries');
    window.localStorage.clear();
  }
}

export default {
  name: 'migrations',
  initialize
};

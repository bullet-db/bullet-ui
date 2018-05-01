/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';

export function initialize(application) {
  let settings = application.lookup('settings:main');
  let migrations = settings.get('migrations');
  let version = settings.get('modelVersion');

  const forage = window.localforage;
  return forage.getItem('modelVersion').then(currentVersion => {
    if (!currentVersion || version > currentVersion) {
      let manager = application.lookup('service:queryManager');
      return applyMigrations(manager, migrations, forage);
    }
  }).then(() => {
    return forage.setItem('modelVersion', version);
  });
}

/**
 * Applies any forced migrations for local storage.
 * @param  {Object} manager The query manager.
 * @param  {Object} migrations An object containing migrations to apply.
 */
export function applyMigrations(manager, migrations, forage) {
  if (!manager) {
    return;
  }
  let deletions = migrations.deletions;
  // Only support clearing everything or results at the moment
  if (isEqual(deletions, 'result')) {
    return manager.deleteAllResults();
  } else if (isEqual(deletions, 'query')) {
    return forage.setDriver(forage.INDEXEDDB).then(() => {
      return forage.clear();
    });
  }
}

export default {
  name: 'migrations',
  after: 'settings',
  initialize
};

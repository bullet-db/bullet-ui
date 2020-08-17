/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';

export async function initialize(application) {
  let settings = application.lookup('settings:main');
  let migrations = settings.get('migrations');
  let version = settings.get('modelVersion');

  const forage = window.localforage;
  let currentVersion = await forage.getItem('modelVersion');
  if (!currentVersion || version > currentVersion) {
    let manager = application.lookup('service:queryManager');
    await applyMigrations(manager, migrations, forage);
  }
  return forage.setItem('modelVersion', version);
}

/**
 * Applies any forced migrations for local storage.
 * @param  {Object} manager The query manager.
 * @param  {Object} migrations An object containing migrations to apply.
 */
export async function applyMigrations(manager, migrations, forage) {
  if (!manager) {
    return;
  }
  let deletions = migrations.deletions;
  // Only support clearing everything or results at the moment
  if (isEqual(deletions, 'result')) {
    return manager.deleteAllResults();
  } else if (isEqual(deletions, 'query')) {
    await forage.setDriver(forage.INDEXEDDB);
    return forage.clear();
  }
}

export default {
  name: 'migrations',
  after: 'settings',
  initialize
};

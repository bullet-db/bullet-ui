/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { isEmpty } from '@ember/utils';
import config from '../config/environment';
import indexeddb from 'ember-localforage/adapters/indexeddb';
import local from 'ember-localforage/adapters/local';

const adapters = EmberObject.create({
  local: local,
  indexeddb: indexeddb
});

export default adapters.getWithDefault(config.APP.SETTINGS.adapter, indexeddb);

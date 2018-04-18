/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';
import config from '../config/environment';
import indexeddb from 'ember-localforage/adapters/indexeddb';
import local from 'ember-localforage/adapters/local';

// The IndexedDB ember-localforage adapter. Override to local when running in test environment.
export default (isEqual(config.APP.SETTINGS.localStorage, 'local') ? local : indexeddb).extend({ });

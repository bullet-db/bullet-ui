/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { computed, get } from '@ember/object';

export default class ColumnAdapter extends JSONAPIAdapter {
  @computed('settings')
  get host() {
    return get(this.settings, 'schemaHost');
  }

  @computed('settings')
  get namespace() {
    return get(this.settings, 'schemaNamespace');
  }

  ajaxOptions() {
    let hash = super.ajaxOptions(...arguments);
    hash.crossDomain = true;
    hash.xhrFields = { withCredentials: true };
    return hash;
  }

  shouldBackgroundReloadAll() {
    // Force the columns to be fetched only once per "session"
    return false;
  }
}

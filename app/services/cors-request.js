/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import fetch from 'fetch';
import { reject } from 'rsvp';
import Service from '@ember/service';

export default class CORSRequestService extends Service {
  get(url, options = { credentials: 'include' }) {
    return fetch(url, options).then(response => {
      if (response.ok) {
        return response.json();
      }
      return reject(`Unable to get ${url}: ${response.statusText}`);
    });
  }
}

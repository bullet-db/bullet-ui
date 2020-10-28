/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import fetch from 'fetch';
import Service from '@ember/service';

export default class CORSRequestService extends Service {
  async method(method, url, options) {
    options.method = method;
    let response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    throw response;
  }

  async get(url, options = { mode: 'cors', credentials: 'include' }) {
    return this.method('GET', url, options);
  }

  async post(url, payload, contentType = 'text/plain', options = { mode: 'cors', credentials: 'include' }) {
    options.headers = { 'Content-Type': contentType };
    options.body = payload;
    return this.method('POST', url, options);
  }
}

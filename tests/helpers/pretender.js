/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import Pretender from 'pretender';
import ENV from 'bullet-ui/config/environment';

const DRPC_ENDPOINT = `${ENV.APP.SETTINGS.drpcHost}/${ENV.APP.SETTINGS.drpcNamespace}/${ENV.APP.SETTINGS.drpcPath}`;
const SCHEMA_ENDPOINT = `${ENV.APP.SETTINGS.schemaHost}/${ENV.APP.SETTINGS.schemaNamespace}/columns`;

export function wrap(statusCode, contentType, response) {
  return [statusCode, { 'Content-Type':  contentType }, response];
}

export function jsonWrap(statusCode, response) {
  return wrap(statusCode, 'application/json', JSON.stringify(response));
}

export function jsonAPIWrap(statusCode, response) {
  return wrap(statusCode, 'application/vnd.api+json', JSON.stringify(response));
}

export function requiredRoutes(data, columns, delay) {
  return function() {
    this.post(DRPC_ENDPOINT, () => {
      return jsonWrap(200, data);
    }, delay);
    this.get(SCHEMA_ENDPOINT, () => {
      return jsonAPIWrap(200, columns);
    }, delay);
  };
}

export function emptyAPI() {
  let pretender = new Pretender();
  pretender.unhandledRequest = (verb, path) => {
    Ember.Logger.log(`Unhandled endpoint for ${verb} on path: ${path}`);
  };
  pretender.map(function() {
    this.post('/write-blanket-coverage', this.passthrough);
  });
  return pretender;
}

export function mockAPI(data, columns, delay = 0) {
  let pretender = emptyAPI();
  pretender.map(requiredRoutes(data, columns, delay));
  return pretender;
}

export function failAPI(columns) {
  let pretender = emptyAPI();
  pretender.map(function() {
    this.post(DRPC_ENDPOINT, () => {
      return jsonWrap(500);
    });
    this.get(SCHEMA_ENDPOINT, () => {
      return jsonAPIWrap(200, columns);
    });
  });
  return pretender;
}


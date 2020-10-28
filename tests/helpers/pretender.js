/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Pretender from 'pretender';
import ENV from 'bullet-ui/config/environment';

const SCHEMA_ENDPOINT = `${ENV.APP.SETTINGS.schemaHost}/${ENV.APP.SETTINGS.schemaNamespace}/columns`;
const VALIDATE_ENDPOINT = `${ENV.APP.SETTINGS.queryHost}/${ENV.APP.SETTINGS.queryNamespace}/${ENV.APP.SETTINGS.validationPath}`;

export function wrap(statusCode, contentType, response) {
  return [statusCode, { 'Content-Type': contentType }, response];
}

export function textWrap(statusCode, response) {
  return wrap(statusCode, 'text/plain', response);
}

export function jsonWrap(statusCode, response) {
  return wrap(statusCode, 'application/json', JSON.stringify(response));
}

export function jsonAPIWrap(statusCode, response) {
  return wrap(statusCode, 'application/vnd.api+json', JSON.stringify(response));
}

export function requiredRoutes(columns) {
  return function() {
    this.get(SCHEMA_ENDPOINT, () => jsonAPIWrap(200, columns));
    this.post(VALIDATE_ENDPOINT, () => [204]);
  };
}

export function emptyAPI() {
  let pretender = new Pretender();
  pretender.map(function() {
    this.post('/write-coverage', this.passthrough);
  });
  return pretender;
}

export function mockAPI(columns) {
  let pretender = emptyAPI();
  pretender.map(requiredRoutes(columns));
  return pretender;
}

export function failValidateAPI(columns, errors) {
  let pretender = emptyAPI();
  pretender.map(function() {
    this.get(SCHEMA_ENDPOINT, () => jsonAPIWrap(200, columns));
    this.post(VALIDATE_ENDPOINT, () => jsonAPIWrap(422, errors));
  });
  return pretender;
}

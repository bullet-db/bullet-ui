/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:cors-request', 'Unit | Service | cors request', {
});

test('it turns on', function(assert) {
  let service = this.subject();
  assert.ok(service);
});

test('it defaults options correctly', function(assert) {
  let service = this.subject();
  let options = service.options('http://localhost/foo');
  assert.equal(options.url, 'http://localhost/foo');
  assert.equal(options.type, 'GET');
  assert.equal(options.crossDomain, true);
  assert.deepEqual(options.xhrFields, { withCredentials: true });
});

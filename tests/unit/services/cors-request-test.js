/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | cors request', function(hooks) {
  setupTest(hooks);

  test('it turns on', function(assert) {
    let service = this.owner.lookup('service:cors-request');
    assert.ok(service);
  });

  test('it defaults options correctly', function(assert) {
    let service = this.owner.lookup('service:cors-request');
    let options = service.options('http://localhost/foo');
    assert.equal(options.url, 'http://localhost/foo');
    assert.equal(options.type, 'GET');
    assert.equal(options.crossDomain, true);
    assert.deepEqual(options.xhrFields, { withCredentials: true });
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';

module('Unit | Service | cors request', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.pretender = new Pretender(function() {
      this.get('/api/pass', function(request) {
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ creds: request.withCredentials })];
      });
      this.get('/api/fail', function() {
        return [404, { }, ''];
      });
    });
  });

  hooks.afterEach(function() {
    this.pretender.shutdown();
  });

  test('it turns on', function(assert) {
    let service = this.owner.lookup('service:cors-request');
    assert.ok(service);
  });

  test('it defaults options correctly', async function(assert) {
    let service = this.owner.lookup('service:cors-request');
    let result = await service.get('/api/pass');
    assert.deepEqual(result, { creds: true });
  });

  test('it rejects if the request cannot be made', async function(assert) {
    assert.expect(0);
    let service = this.owner.lookup('service:cors-request');
    try {
      await service.get('/api/fail');
      assert.ok(false, 'Expected the call to fail but it passed instead');
    } catch (error) {
      // empty
    }
  });
});

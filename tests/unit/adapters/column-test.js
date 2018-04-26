/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | column', function(hooks) {
  setupTest(hooks);

  test('it does not background reload', function(assert) {
    let adapter = this.owner.lookup('adapter:column');
    assert.notOk(adapter.shouldBackgroundReloadAll());
  });

  test('it defaults options correctly', function(assert) {
    let adapter = this.owner.lookup('adapter:column');
    let url = 'example.com';
    let type = 'GET';
    let options = adapter.ajaxOptions(url, type, {});
    assert.equal(options.url, url);
    assert.equal(options.type, type);
    assert.equal(options.crossDomain, true);
    assert.deepEqual(options.xhrFields, { withCredentials: true });
  });
});

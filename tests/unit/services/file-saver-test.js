/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let originalSave;

module('Unit | Service | file saver', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    run(() => {
      originalSave = window.saveAs;
    });
  });

  hooks.afterEach(function() {
    window.saveAs = originalSave;
  });

  test('it uses the window saveAs to save', function(assert) {
    assert.expect(2);
    let service = this.owner.lookup('service:file-saver');
    window.saveAs = (blob, name) => {
      assert.equal(name, 'test');
    };
    assert.ok(service);
    service.save({}, 'someMIMEType', 'test');
  });
});

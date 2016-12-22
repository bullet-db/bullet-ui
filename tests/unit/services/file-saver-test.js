/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

let originalSave;

moduleFor('service:file-saver', 'Unit | Service | file saver', {
  beforeEach() {
    Ember.run(function() {
      originalSave = window.saveAs;
    });
  },

  afterEach() {
    window.saveAs = originalSave;
  }
});

test('it uses the window saveAs to save', function(assert) {
  assert.expect(2);
  let service = this.subject();
  window.saveAs = (blob, name) => {
    assert.equal(name, 'test');
  };
  assert.ok(service);
  service.save({}, 'someMIMEType', 'test');
});

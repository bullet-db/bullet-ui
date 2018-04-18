/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('column', 'Unit | Model | column', {
});

test('it does not allow freeform subfields if it has a wrong type', function(assert) {
  let model = this.subject({ name: 'test', type: 'LIST', subtype: 'MAP' });
  assert.notOk(model.get('hasFreeformField'));
});

test('it does not allow freeform subfields if it has no subtype', function(assert) {
  let model = this.subject({ name: 'test', type: 'MAP' });
  assert.notOk(model.get('hasFreeformField'));
  model = this.subject({ name: 'test', type: 'STRING' });
  assert.notOk(model.get('hasFreeformField'));
});

test('it does not allow freeform subfields if it has enumerations', function(assert) {
  let model = this.subject({ name: 'test', type: 'STRING', enumerations: [{ name: 'foo' }] });
  assert.notOk(model.get('hasFreeformField'));
});

test('it allows freeform subfields only if it is a MAP and has a subtype and there are no enumerations', function(assert) {
  let model = this.subject({ name: 'test', type: 'MAP', subtype: 'STRING' });
  assert.ok(model.get('hasFreeformField'));
});

test('it returns false if there are no enumerations', function(assert) {
  let model = this.subject({ name: 'test', type: 'MAP', subtype: 'STRING' });
  let enumerations = model.get('enumeratedColumns');
  assert.notOk(enumerations);
});

test('it flat maps enumerated columns', function(assert) {
  let model = this.subject({ name: 'test', type: 'MAP', subtype: 'STRING',
                              enumerations: [
                                { name: 'foo' },
                                { name: 'bar' }
                              ]
                            });
  let enumerations = A(model.get('enumeratedColumns'));
  assert.equal(enumerations.length, 2);
  assert.equal(enumerations.objectAt(0).get('name'), 'test.foo');
  assert.equal(enumerations.objectAt(0).get('type'), 'STRING');
  assert.equal(enumerations.objectAt(1).get('name'), 'test.bar');
  assert.equal(enumerations.objectAt(1).get('type'), 'STRING');
});

test('it returns itself when asked for all flattened columns', function(assert) {
  let model = this.subject({ name: 'test', type: 'MAP', subtype: 'STRING',
                              enumerations: [
                                { name: 'foo' },
                                { name: 'bar' }
                              ]
                            });
  let flattenedColumns = A(model.get('flattenedColumns'));
  assert.equal(flattenedColumns.length, 3);
  assert.equal(flattenedColumns.objectAt(0).get('name'), 'test');
  assert.equal(flattenedColumns.objectAt(0).get('type'), 'MAP');
  assert.equal(flattenedColumns.objectAt(1).get('name'), 'test.foo');
  assert.equal(flattenedColumns.objectAt(1).get('type'), 'STRING');
  assert.equal(flattenedColumns.objectAt(2).get('name'), 'test.bar');
  assert.equal(flattenedColumns.objectAt(2).get('type'), 'STRING');
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | column', function(hooks) {
  setupTest(hooks);

  test('it does not allow freeform subFields if it has a wrong type', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'LIST', subType: 'MAP' })
    );
    assert.notOk(model.get('hasFreeFormField'));
  });

  test('it does not allow freeform subFields if it has no subType', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'MAP' }));
    assert.notOk(model.get('hasFreeFormField'));
    model = run(() => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'STRING' }));
    assert.notOk(model.get('hasFreeFormField'));
  });

  test('it does not allow freeform subFields if it has enumerations', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'STRING', enumerations: [{ name: 'foo' }] })
    );
    assert.notOk(model.get('hasFreeFormField'));
  });

  test('it allows freeform subFields only if it is a MAP and has a subType and there are no enumerations', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'MAP', subType: 'STRING' })
    );
    assert.ok(model.get('hasFreeFormField'));
  });

  test('it returns false if there are no enumerations', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'MAP', subType: 'STRING' })
    );
    let enumerations = model.get('enumeratedColumns');
    assert.notOk(enumerations);
  });

  test('it flat maps enumerated columns', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'MAP', subType: 'STRING',
        enumerations: [
          { name: 'foo' },
          { name: 'bar' }
        ]
      })
    );
    let enumerations = A(model.get('enumeratedColumns'));
    assert.equal(enumerations.length, 2);
    assert.equal(enumerations.objectAt(0).get('name'), 'test.foo');
    assert.equal(enumerations.objectAt(0).get('type'), 'STRING');
    assert.equal(enumerations.objectAt(1).get('name'), 'test.bar');
    assert.equal(enumerations.objectAt(1).get('type'), 'STRING');
  });

  test('it returns itself when asked for all flattened columns', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'MAP', subType: 'STRING',
        enumerations: [
          { name: 'foo' },
          { name: 'bar' }
        ]
      })
    );
    let flattenedColumns = A(model.get('flattenedColumns'));
    assert.equal(flattenedColumns.length, 3);
    assert.equal(flattenedColumns.objectAt(0).get('name'), 'test');
    assert.equal(flattenedColumns.objectAt(0).get('type'), 'MAP');
    assert.equal(flattenedColumns.objectAt(1).get('name'), 'test.foo');
    assert.equal(flattenedColumns.objectAt(1).get('type'), 'STRING');
    assert.equal(flattenedColumns.objectAt(2).get('name'), 'test.bar');
    assert.equal(flattenedColumns.objectAt(2).get('type'), 'STRING');
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { FREEFORM, MAP_FREEFORM_SUFFIX, wrapMapKey, wrapListIndex } from 'bullet-ui/utils/type';

module('Unit | Model | column', function(hooks) {
  setupTest(hooks);

  test('it does not allow freeform subFields if it has a wrong type', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'BIGINTEGER' })
    );
    assert.notOk(model.get('hasFreeFormField'));
  });

  test('it does not allow freeform subFields if it has no valid subType', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'STRING_LIST' })
    );
    assert.notOk(model.get('hasFreeFormField'));

    model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'STRING' })
    );
    assert.notOk(model.get('hasFreeFormField'));

    model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'DOUBLE_MAP_LIST' })
    );
    assert.notOk(model.get('hasFreeFormField'));
  });

  test('it allows freeform subFields even if it has enumerations', function(assert) {
    let model = run(
      () =>
      this.owner.lookup('service:store').createRecord(
        'column', { name: 'test', type: 'STRING_MAP', subFields: [{ name: 'foo' }] }
      )
    );
    assert.ok(model.get('hasEnumerations'));
    assert.ok(model.get('hasFreeFormSubField'));
    assert.notOk(model.get('hasFreeFormSubSubField'));
    model = run(
      () =>
      this.owner.lookup('service:store').createRecord(
        'column', { name: 'test', type: 'STRING_MAP_MAP', subFields: [{ name: 'foo' }], subSubFields: [{ name: 'bar' }] }
      )
    );
    assert.ok(model.get('hasEnumerations'));
    assert.ok(model.get('hasFreeFormSubField'));
    assert.ok(model.get('hasFreeFormSubSubField'));
  });

  test('it allows freeform subFields when there are no enumerations', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'FLOAT_MAP' })
    );
    assert.ok(model.get('hasFreeFormSubField'));
    assert.notOk(model.get('hasFreeFormSubSubField'));
  });

  test('it returns empty if there are no enumerations', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord('column', { name: 'test', type: 'STRING_MAP' })
    );
    let enumerations = model.get('enumeratedColumns');
    assert.notOk(model.get('hasEnumerations'));
    assert.equal(enumerations.length, 0);
  });

  test('it flat maps enumerated columns', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord(
        'column', { name: 'test', type: 'STRING_MAP_MAP', subFields: [{ name: 'foo' }], subSubFields: [{ name: 'bar' }] }
      )
    );
    let enumerations = A(model.get('enumeratedColumns'));
    assert.equal(enumerations.length, 2);
    assert.equal(enumerations.objectAt(0).get('name'), wrapMapKey('test', 'foo'));
    assert.equal(enumerations.objectAt(0).get('type'), 'STRING_MAP');
    assert.equal(enumerations.objectAt(1).get('name'), wrapMapKey(`test${MAP_FREEFORM_SUFFIX}`, 'bar'));
    assert.equal(enumerations.objectAt(1).get('type'), 'STRING');
  });

  test('it returns itself and all nested levels of columns when asked for all flattened columns on a map', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord(
        'column', { name: 'test', type: 'STRING_MAP_MAP', subFields: [{ name: 'foo' }], subSubFields: [{ name: 'bar' }] }
      )
    );
    let flattenedColumns = A(model.get('flattenedColumns'));
    assert.equal(flattenedColumns.length, 5);
    assert.equal(flattenedColumns.objectAt(0).get('name'), 'test');
    assert.equal(flattenedColumns.objectAt(0).get('type'), 'STRING_MAP_MAP');
    assert.equal(flattenedColumns.objectAt(1).get('name'), 'test');
    assert.equal(flattenedColumns.objectAt(1).get('type'), 'STRING_MAP');
    assert.equal(flattenedColumns.objectAt(1).get('isSubField'), true);
    assert.equal(flattenedColumns.objectAt(2).get('name'), wrapMapKey('test', 'foo'));
    assert.equal(flattenedColumns.objectAt(2).get('type'), 'STRING_MAP');
    assert.equal(flattenedColumns.objectAt(3).get('name'), wrapMapKey('test', 'foo'));
    assert.equal(flattenedColumns.objectAt(3).get('type'), 'STRING');
    assert.equal(flattenedColumns.objectAt(3).get('isSubField'), true);
    assert.equal(flattenedColumns.objectAt(4).get('name'), wrapMapKey(wrapMapKey('test', 'foo'), 'bar'));
    assert.equal(flattenedColumns.objectAt(4).get('type'), 'STRING');
  });

  test('it returns itself and all nested levels of columns when asked for all flattened columns on a list', function(assert) {
    let model = run(
      () => this.owner.lookup('service:store').createRecord(
        'column', { name: 'test', type: 'FLOAT_MAP_LIST', subListFields: [{ name: 'foo' }, { name: 'bar' }] }
      )
    );
    let flattenedColumns = A(model.get('flattenedColumns'));
    assert.equal(flattenedColumns.length, 1);
    assert.equal(flattenedColumns.objectAt(0).get('name'), 'test');
    assert.equal(flattenedColumns.objectAt(0).get('type'), 'FLOAT_MAP_LIST');

    let enumeratedColumns = A(model.get('enumeratedColumns'));
    assert.equal(enumeratedColumns.length, 2);
    assert.equal(enumeratedColumns.objectAt(0).get('name'), wrapMapKey(wrapListIndex('test', FREEFORM), 'foo'));
    assert.equal(enumeratedColumns.objectAt(0).get('type'), 'FLOAT');
    assert.equal(enumeratedColumns.objectAt(1).get('name'), wrapMapKey(wrapListIndex('test', FREEFORM), 'bar'));
    assert.equal(enumeratedColumns.objectAt(1).get('type'), 'FLOAT');
  });
});

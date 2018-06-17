/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import QueryableMixin from 'bullet-ui/mixins/queryable';
import { module, test } from 'qunit';

module('Unit | Mixin | queryable', function() {
  test('it transitions to a saved result when calling resultHandler', function(assert) {
    assert.expect(2);
    let QueryableObject = EmberObject.extend(QueryableMixin);
    let subject = QueryableObject.create();
    let mockTransitionTo = (item, id) => {
      assert.equal(item, 'result');
      assert.equal(id, 'foo');
    };
    subject.set('savedResult', EmberObject.create({ id: 'foo' }));
    subject.set('transitionTo', mockTransitionTo);
    subject.resultHandler(subject);
  });

  test('it transitions to an error when calling errorHandler', function(assert) {
    assert.expect(1);
    let QueryableObject = EmberObject.extend(QueryableMixin);
    let subject = QueryableObject.create();
    let mockTransition = item => {
      assert.equal(item, 'errored');
    };
    subject.set('transitionTo', mockTransition);
    subject.errorHandler('Mocked Test Error', subject);
  });

  test('it adds a window to the savedResult when calling windowHandler', function(assert) {
    assert.expect(2);
    let QueryableObject = EmberObject.extend(QueryableMixin);
    let subject = QueryableObject.create();
    let mockAddSegment = (result, message) => {
      assert.equal(result.get('id'), 'foo');
      assert.equal(message.get('id'), 'bar');
    };
    subject.set('savedResult', EmberObject.create({ id: 'foo' }));
    subject.set('queryManager', { addSegment: mockAddSegment });
    subject.windowHandler(EmberObject.create({ id: 'bar' }), subject);
  });

  test('it can submit a query, save a result and attach the appropriate handlers', function(assert) {
    assert.expect(6);

    let QueryableObject = EmberObject.extend(QueryableMixin);
    let subject = QueryableObject.create();

    let mockTransitionTo = () => {
      // Will be called twice (success and error)
      assert.ok(true);
    };
    let mockSend = (query, handlers, context) => {
      assert.equal(query.get('id'), 'foo');
      handlers.success(context)
      handlers.error('Mocked Test Error', context);
      handlers.message(EmberObject.create({ id: 'baz' }), context);
    };
    let mockAddSegment = (result, message) => {
      assert.equal(result.get('id'), 'bar');
      assert.equal(message.get('id'), 'baz');
    };

    subject.set('queryManager', { addSegment: mockAddSegment });
    subject.set('querier', { send: mockSend });
    subject.set('transitionTo', mockTransitionTo);
    subject.submitQuery(EmberObject.create({ id: 'foo' }), EmberObject.create({ id: 'bar' }), subject);
    assert.equal(subject.get('savedResult.id'), 'bar');
  });

  test('it can late submit a query using a saved result and attach the appropriate handlers', function(assert) {
    assert.expect(5);

    let QueryableObject = EmberObject.extend(QueryableMixin);
    let subject = QueryableObject.create();

    let mockTransitionTo = () => {
      // Will be called once on error
      assert.ok(true);
    };
    let mockSend = (query, handlers, context) => {
      assert.equal(query.get('id'), 'foo');
      handlers.success(context)
      handlers.error('Mocked Test Error', context);
      handlers.message(EmberObject.create({ id: 'baz' }), context);
    };
    let mockAddSegment = (result, message) => {
      assert.equal(result.get('id'), 'bar');
      assert.equal(message.get('id'), 'baz');
    };

    subject.set('queryManager', { addSegment: mockAddSegment });
    subject.set('querier', { send: mockSend });
    subject.set('transitionTo', mockTransitionTo);
    subject.set('savedResult', EmberObject.create({ id: 'bar' }));
    subject.lateSubmitQuery(EmberObject.create({ id: 'foo' }), subject);
    // Make sure result is still the same
    assert.equal(subject.get('savedResult.id'), 'bar');
  });
});

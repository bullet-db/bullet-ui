/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import isEmpty from 'bullet-ui/utils/is-empty';
import { module, test } from 'qunit';

module('Unit | Utility | is empty', function() {
  test('it matches Ember isEmpty', function(assert) {
    assert.ok(isEmpty());
    assert.ok(isEmpty(null));
    assert.ok(isEmpty(undefined));
    assert.ok(isEmpty(''));
    assert.ok(isEmpty([]));
    assert.ok(isEmpty({ size: 0}));
    assert.notOk(isEmpty({ }));
    assert.notOk(isEmpty('foo'));
    assert.notOk(isEmpty([0,1,2]));
    assert.notOk(isEmpty('\n\t'));
    assert.notOk(isEmpty('  '));
    assert.notOk(isEmpty({ size: 1 }));
    assert.notOk(isEmpty({ size: () => 0 }));
  });
});

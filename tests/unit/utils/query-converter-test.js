/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import QueryConverter from 'bullet-ui/utils/query-converter';
import { module, test } from 'qunit';

module('Unit | Utility | query converter', function(hooks) {
  test('it exists', function(assert) {
    let subject = new QueryConverter();
    assert.ok(subject);
  });
});

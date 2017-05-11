/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | result error', {
  suppressLogging: true
});

test('visiting a non-existant result', function(assert) {
  visit('/result/foo');

  andThen(function() {
    assert.equal(currentURL(), '/not-found');
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import PaginatedTableMixin from 'bullet-ui/mixins/paginated-table';
import { module, test } from 'qunit';

module('Unit | Mixin | paginated table');

test('it works', function(assert) {
  let PaginatedTableObject = Ember.Object.extend(PaginatedTableMixin);
  let subject = PaginatedTableObject.create();
  assert.ok(subject);
});

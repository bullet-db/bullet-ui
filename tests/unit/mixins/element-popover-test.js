/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import ElementPopoverMixin from 'bullet-ui/mixins/element-popover';
import { module, test } from 'qunit';

module('Unit | Mixin | element popover');

test('it works', function(assert) {
  let ElementPopoverObject = EmberObject.extend(ElementPopoverMixin);
  let subject = ElementPopoverObject.create();
  assert.ok(subject);
});

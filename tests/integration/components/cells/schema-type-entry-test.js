/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('schema-type-entry', 'Integration | Component | Cell | schema type entry', {
  integration: true
});

test('it displays a type value', function(assert) {
  this.render(hbs`{{cells/schema-type-entry value='MAP OF STRINGS TO STRINGS'}}`);
  assert.equal(this.$().text().trim(), 'MAP OF STRINGS TO STRINGS');
});

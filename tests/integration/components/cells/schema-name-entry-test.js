/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('schema-name-entry', 'Integration | Component | Cell | schema name entry', {
  integration: true
});

test('it displays a simple column', function(assert) {
  this.set('mockRow', EmberObject.create({
    name: 'foo'
  }));
  this.render(hbs`{{cells/schema-name-entry row=mockRow}}`);

  assert.equal(this.$().text().trim(), 'foo');
  assert.equal(this.$().find('.schema-enumeration-caret').length, 0);
});

test('it displays an subfield column', function(assert) {
  this.set('mockRow', EmberObject.create({
    name: 'foo.bar',
    isSubfield: true
  }));
  this.render(hbs`{{cells/schema-name-entry row=mockRow}}`);

  assert.equal(this.$().text().trim(), 'bar');
  assert.equal(this.$().find('.schema-enumeration-caret').length, 0);
});

test('it displays an expand caret if the row has enumerations', function(assert) {
  this.set('mockRow', EmberObject.create({
    name: 'foo.bar',
    isSubfield: true,
    hasEnumerations: true
  }));
  this.render(hbs`{{cells/schema-name-entry row=mockRow}}`);

  assert.equal(this.$().find('.schema-enumeration-caret > .expand-caret').length, 1);
});

test('it displays an expanded caret if the row is expanded', function(assert) {
  this.set('mockRow', EmberObject.create({
    name: 'foo.bar',
    isSubfield: true,
    hasEnumerations: true,
    expanded: true
  }));
  this.render(hbs`{{cells/schema-name-entry row=mockRow}}`);

  assert.equal(this.$().find('.schema-enumeration-caret > .expanded-caret').length, 1);
});

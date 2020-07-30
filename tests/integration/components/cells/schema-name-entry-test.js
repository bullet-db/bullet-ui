/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Cell | schema name entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a simple column', async function(assert) {
    this.set('mockRow', EmberObject.create({
      name: 'foo'
    }));
    await render(hbs`<Cells::SchemaNameEntry @row={{this.mockRow}}/>`);

    assert.dom(this.element).hasText('foo');
    assert.equal(this.element.querySelectorAll('.schema-enumeration-caret').length, 0);
  });

  test('it displays an subfield column', async function(assert) {
    this.set('mockRow', EmberObject.create({
      name: 'foo.bar',
      isSubfield: true
    }));
    await render(hbs`<Cells::SchemaNameEntry @row={{this.mockRow}}/>`);

    assert.dom(this.element).hasText('bar');
    assert.equal(this.element.querySelectorAll('.schema-enumeration-caret').length, 0);
  });

  test('it displays an expand caret if the row has enumerations', async function(assert) {
    this.set('mockRow', EmberObject.create({
      name: 'foo.bar',
      isSubfield: true,
      hasEnumerations: true
    }));
    await render(hbs`<Cells::SchemaNameEntry @row={{this.mockRow}}/>`);

    assert.equal(this.element.querySelectorAll('.schema-enumeration-caret > .expand-caret').length, 1);
  });

  test('it displays an expanded caret if the row is expanded', async function(assert) {
    this.set('mockRow', EmberObject.create({
      name: 'foo.bar',
      isSubfield: true,
      hasEnumerations: true,
      expanded: true
    }));
    await render(hbs`<Cells::SchemaNameEntry @row={{this.mockRow}}/>`);

    assert.equal(this.element.querySelectorAll('.schema-enumeration-caret > .expanded-caret').length, 1);
  });
});

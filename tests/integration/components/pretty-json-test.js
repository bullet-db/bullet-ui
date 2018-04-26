/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pretty json', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders edge cases', async function(assert) {
    await render(hbs`{{pretty-json}}`);
    assert.equal(this.$().text().trim(), 'null');

    await render(hbs`
      {{#pretty-json}}
        template block text
      {{/pretty-json}}
    `);
    assert.equal(this.$().text().trim(), 'null');

    this.set('json', undefined);
    await render(hbs`{{pretty-json data=json}}`);
    assert.equal(this.$().text().trim(), 'undefined');

    this.set('json', []);
    await render(hbs`{{pretty-json data=json}}`);
    assert.equal(this.$().text().trim(), 'Array[0][]');

    this.set('json', { });
    await render(hbs`{{pretty-json data=json}}`);
    assert.equal(this.$().text().trim(), 'Object{}');
  });

  test('it wraps content in a pre tag', async function(assert) {
    await render(hbs`{{pretty-json}}`);
    assert.equal(this.$('pre.pretty-json-container').length, 1);
  });

  test('it formats json and opens to two levels by default', async function(assert) {
    let json = { foo: { bar: 'baz', test: 'foo' } };
    this.set('json', json);
    await render(hbs`{{pretty-json data=json}}`);
    assert.equal(this.$('.json-formatter-open').length, 2);
    assert.equal(this.$('.json-formatter-row').length, 4);
  });

  test('it collapses json to the given levels', async function(assert) {
    let json = { foo: { bar: 'baz', test: 'foo' } };
    this.set('json', json);
    this.set('mockLevels', 1);
    await render(hbs`{{pretty-json data=json defaultLevels=mockLevels}}`);
    assert.equal(this.$('.json-formatter-open').length, 1);
  });
});

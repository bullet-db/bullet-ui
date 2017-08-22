/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pretty-json', 'Integration | Component | pretty json', {
  integration: true
});

test('it renders edge cases', function(assert) {
  this.render(hbs`{{pretty-json}}`);
  assert.equal(this.$().text().trim(), 'null');

  this.render(hbs`
    {{#pretty-json}}
      template block text
    {{/pretty-json}}
  `);
  assert.equal(this.$().text().trim(), 'null');

  this.set('json', undefined);
  this.render(hbs`{{pretty-json data=json}}`);
  assert.equal(this.$().text().trim(), 'undefined');

  this.set('json', []);
  this.render(hbs`{{pretty-json data=json}}`);
  assert.equal(this.$().text().trim(), 'Array[0][]');

  this.set('json', { });
  this.render(hbs`{{pretty-json data=json}}`);
  assert.equal(this.$().text().trim(), 'Object{}');
});

test('it wraps content in a pre tag', function(assert) {
  this.render(hbs`{{pretty-json}}`);
  assert.equal(this.$('pre.pretty-json-container').length, 1);
});

test('it formats json and opens to two levels by default', function(assert) {
  let json = { foo: { bar: 'baz', test: 'foo' } };
  this.set('json', json);
  this.render(hbs`{{pretty-json data=json}}`);
  assert.equal(this.$('.json-formatter-open').length, 2);
  assert.equal(this.$('.json-formatter-row').length, 4);
});

test('it collapses json to the given levels', function(assert) {
  let json = { foo: { bar: 'baz', test: 'foo' } };
  this.set('json', json);
  this.set('mockLevels', 1);
  this.render(hbs`{{pretty-json data=json defaultLevels=mockLevels}}`);
  assert.equal(this.$('.json-formatter-open').length, 1);
});

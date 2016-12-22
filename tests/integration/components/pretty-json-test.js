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

test('it renders', function(assert) {
  this.render(hbs`{{pretty-json}}`);
  assert.equal(this.$().text().trim(), '');

  this.render(hbs`
    {{#pretty-json}}
      template block text
    {{/pretty-json}}
  `);
  assert.equal(this.$().text().trim(), '');
});

test('it formats json', function(assert) {
  let json = { foo: { bar: 'baz', test: 'foo' } };
  this.set('json', json);
  this.render(hbs`{{pretty-json data=json spacing=4}}`);
  assert.equal(this.$('pre').html(), JSON.stringify(json, null, 4));
});

test('it wraps content in a div', function(assert) {
  this.render(hbs`{{pretty-json}}`);
  assert.equal(this.$('div.pretty-json-container').length, 1);
});

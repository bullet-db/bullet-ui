/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('schema-description-entry', 'Integration | Component | Cell | schema description entry', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{cells/schema-description-entry value='foo'}}`);

  assert.equal(this.$().text().trim(), 'foo');
});

test('it renders html', function(assert) {
  this.render(hbs`{{cells/schema-description-entry value='<div><p>foo</p></div>'}}`);

  assert.equal(this.$().text().trim(), 'foo');
  assert.equal(this.$('div > p').length, 1);
});

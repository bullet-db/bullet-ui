/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('result-metadata', 'Integration | Component | result metadata', {
  integration: true
});

test('it does not block render', function(assert) {
  this.render(hbs`{{result-metadata}}`);
  assert.equal(this.$().text().trim(), '');
  this.render(hbs`
    {{#result-metadata}}
      template block text
    {{/result-metadata}}
  `);
  assert.equal(this.$().text().trim(), '');
});

test('it expands metadata on clicking the expand bar', function(assert) {
  assert.expect(3);

  this.set('mockMetadata', 'custom metadata');
  this.render(hbs`{{result-metadata metadata=mockMetadata}}`);
  assert.notOk(this.$('.result-metadata').hasClass('is-expanded'));
  this.$('.expand-bar').click();
  return wait().then(() => {
    assert.ok(this.$('.result-metadata').hasClass('is-expanded'));
    assert.equal(this.$('pre').text().trim(), '\"custom metadata\"');
  });
});

/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('mode-toggle', 'Integration | Component | mode toggle', {
  integration: true
});

test('it renders two buttons with texts', function(assert) {
  this.render(hbs`{{mode-toggle}}`);
  assert.equal(this.$().text().trim(), 'Toggled\n Not Toggled');
  assert.equal(this.$('button').length, 2);
  this.render(hbs`
    {{#mode-toggle}}
      template block text
    {{/mode-toggle}}
  `);
  assert.equal(this.$().text().trim(), 'Toggled\n Not Toggled');
  assert.equal(this.$('button').length, 2);
  assert.ok(this.$('.left-view').hasClass('selected'));
});

test('it renders two buttons with provided texts', function(assert) {
  this.render(hbs`{{mode-toggle toggledText="Foo" notToggledText="Bar"}}`);
  assert.equal(this.$().text().trim(), 'Foo\n Bar');
  assert.equal(this.$('button').length, 2);
});

test('it allows you to toggle modes', function(assert) {
  assert.expect(4);
  this.set('mockToggled', isToggled => {
    assert.notOk(isToggled);
  });
  this.render(hbs`{{mode-toggle onToggled=mockToggled}}`);
  assert.ok(this.$('.left-view').hasClass('selected'));
  this.$('.right-view').click();
  return wait().then(() => {
    assert.notOk(this.$('.left-view').hasClass('selected'));
    assert.ok(this.$('.right-view').hasClass('selected'));
  });
});

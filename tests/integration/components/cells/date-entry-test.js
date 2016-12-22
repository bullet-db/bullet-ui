/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('date-entry', 'Integration | Component | Cell | date entry', {
  integration: true
});

test('it renders an empty date text when there is no date provided', function(assert) {
  this.render(hbs`{{cells/date-entry}}`);

  assert.equal(this.$().text().trim(), '--');

  this.render(hbs`
    {{#cells/date-entry}}
      template block text
    {{/cells/date-entry}}
  `);

  assert.equal(this.$().text().trim(), '--');
});

test('it renders a date in the default format', function(assert) {
  this.set('date', new Date(2016, 8, 1, 3, 16));
  this.render(hbs`{{cells/date-entry value=date}}`);

  assert.equal(this.$().text().trim(), '01 Sep 03:16 AM');
});


test('it renders a date in the given format', function(assert) {
  this.set('date', new Date(2016, 8, 1, 3, 16));
  this.render(hbs`{{cells/date-entry value=date format='D/M HH:m'}}`);

  assert.equal(this.$().text().trim(), '1/9 03:16');
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('results-table', 'Integration | Component | results table', {
  integration: true
});

test('it displays a row with two cells in two columns', function(assert) {
  assert.expect(4);
  this.set('mockResults', Ember.A([
                            Ember.Object.create({ created: new Date(2014, 11, 31), records: Ember.A([1, 2, 3]) })
                           ]));
  this.render(hbs`{{results-table results=mockResults}}`);
  assert.equal(this.$('.lt-head .lt-column').eq(0).text().trim(), 'Date');
  assert.equal(this.$('.lt-head .lt-column').eq(1).text().trim(), '# Records');
  assert.equal(this.$('.lt-body .lt-row .lt-cell').eq(0).text().trim(), '31 Dec 12:00 AM');
  assert.equal(this.$('.lt-body .lt-row .lt-cell').eq(1).text().trim(), '3');
});

test('it sorts a column on click', function(assert) {
  assert.expect(2);
  this.set('mockResults', Ember.A([
                            Ember.Object.create({ created: new Date(2014, 11, 31), records: Ember.A([1, 2, 3]) }),
                            Ember.Object.create({ created: new Date(2015, 1, 1), records: Ember.A() })
                           ]));
  this.render(hbs`{{results-table results=mockResults}}`);
  assert.equal(this.$('.lt-head .lt-column.is-sortable').length, 2);
  this.$('.lt-head .lt-column.is-sortable').eq(1).click();
  return wait().then(() => {
    let text = this.$('.lt-body .lt-row .lt-cell').text();
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '01Feb12:00AM031Dec12:00AM3');
  });
});

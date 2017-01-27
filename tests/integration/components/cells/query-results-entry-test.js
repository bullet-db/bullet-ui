/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('query-results-entry', 'Integration | Component | Cell | query results entry', {
  integration: true
});

test('it renders the empty state when there are no results', function(assert) {
  this.render(hbs`{{cells/query-results-entry}}`);
  assert.equal(this.$().text().trim(), '--');
});

test('it renders the run count if there were results', function(assert) {
  this.set('mockValue', Ember.A([Ember.Object.create({ foo: 2 })]));
  this.render(hbs`{{cells/query-results-entry value=mockValue}}`);
  assert.equal(this.$('.length-entry').text().trim(), '1 Results');
});

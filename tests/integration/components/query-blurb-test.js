/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import MockQuery from '../../helpers/mocked-query';

moduleForComponent('query-blurb', 'Integration | Component | query blurb', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{query-blurb}}`);

  let actualText = this.$().text();
  let spaceLess = actualText.replace(/\s/g, '');
  assert.equal(spaceLess, 'Filters:Fields:');

  // Template block usage:
  this.render(hbs`
    {{#query-blurb}}
      template block text
    {{/query-blurb}}
  `);
  actualText = this.$().text();
  spaceLess = actualText.replace(/\s/g, '');
  assert.equal(spaceLess, 'Filters:Fields:');
});

test('it fully summarizes a query', function(assert) {
  let query = MockQuery.create({ duration: 1 });
  query.addAggregation(AGGREGATIONS.get('LIMIT'), 1, { points: '0.1,0.2' });
  query.addFilter({ }, 'An Actual Filter Summary');
  query.addProjection('foo', 'f');
  query.addProjection('bar', 'b');
  this.set('mockedQuery', query);
  this.render(hbs`{{query-blurb query=mockedQuery}}`);
  let actualText = this.$().text();
  let spaceLess = actualText.replace(/\s/g, '');
  assert.equal(spaceLess, 'Filters:AnActualFilterSummaryFields:fb0.1,0.2');
});

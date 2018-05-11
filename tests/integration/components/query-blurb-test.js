/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import MockQuery from '../../helpers/mocked-query';

module('Integration | Component | query blurb', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{query-blurb}}`);

    let actualText = this.$().text();
    let spaceLess = actualText.replace(/\s/g, '');
    assert.equal(spaceLess, 'Filters:Fields:Window:');

    // Template block usage:
    await render(hbs`
      {{#query-blurb}}
        template block text
      {{/query-blurb}}
    `);
    actualText = this.$().text();
    spaceLess = actualText.replace(/\s/g, '');
    assert.equal(spaceLess, 'Filters:Fields:Window:');
  });

  test('it fully summarizes a query', async function(assert) {
    let query = MockQuery.create({ duration: 1 });
    query.addAggregation(AGGREGATIONS.get('LIMIT'), 1, { points: '0.1,0.2' });
    query.addFilter({ }, 'An Actual Filter Summary');
    query.addProjection('foo', 'f');
    query.addProjection('bar', 'b');
    this.set('mockedQuery', query);
    await render(hbs`{{query-blurb summary=mockedQuery}}`);
    let actualText = this.$().text();
    let spaceLess = actualText.replace(/\s/g, '');
    assert.equal(spaceLess, 'Filters:AnActualFilterSummaryFields:fb0.1,0.2Window:None');
  });
});

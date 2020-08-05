/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import MockQuery from 'bullet-ui/tests/helpers/mocked-query';

module('Integration | Component | query blurb', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<QueryBlurb/>`);
    assert.dom(this.element).includesText('Filters: Fields: Window:');

    await render(hbs`<QueryBlurb>template block text</QueryBlurb>`);
    assert.dom(this.element).includesText('Filters: Fields: Window:');
  });

  test('it fully summarizes a query', async function(assert) {
    let query = MockQuery.create({ duration: 1 });
    query.addAggregation(AGGREGATIONS.get('LIMIT'), 1, { points: '0.1,0.2' });
    query.addFilter({ }, 'An Actual Filter Summary');
    query.addProjection('foo', 'f');
    query.addProjection('bar', 'b');
    this.set('mockedQuery', query);
    await render(hbs`<QueryBlurb @summary={{this.mockedQuery}}/>`);
    let actualText = this.element.textContent;
    let spaceLess = actualText.replace(/\s/g, '');
    assert.dom(this.element).includesText('Filters: An Actual Filter Summary Fields: fb0.1,0.2 Window: None');
  });
});

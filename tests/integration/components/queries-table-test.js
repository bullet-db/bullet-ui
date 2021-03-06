/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { assertTooltipNotRendered, assertTooltipRendered } from 'ember-tooltips/test-support/dom';
import MockQuery from 'bullet-ui/tests/helpers/mocked-query';

module('Integration | Component | queries table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders four columns when passed in a query', async function(assert) {
    let query = MockQuery.create({ duration: 1 });
    query.addFilter({ }, 'An Actual Filter Summary');
    query.addProjection('foo', 'f');
    query.addProjection('bar', 'b');
    query.addResult([]);
    query.addResult([]);
    query.set('name', 'foo');
    this.set('mockQueries', A([query]));

    await render(hbs`<QueriesTable @queries={{this.mockQueries}}/>`);
    assertTooltipNotRendered(assert);
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[0]).hasNoText();
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[1]).hasText('Query');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[2]).hasText('Last Result');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[3]).hasText('Historical Results');
    assert.dom('.lt-body .lt-row').exists({ count: 1 });
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[0]).hasNoText();
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[1]).hasText('foo');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[2]).hasText('03 Jan 12:00 AM');
    assert.dom(this.element.querySelector('.lt-body .lt-row .lt-cell .length-entry')).hasText('2 Results');
  });

  test('it has a default sort by name and can manually sort on click', async function(assert) {
    assert.expect(4);

    let queryA = MockQuery.create({ duration: 1 });
    queryA.addFilter({ }, 'An Actual Filter Summary');
    queryA.addProjection('foo', 'f');
    queryA.addProjection('bar', 'b');
    let queryB = MockQuery.create({ duration: 1 });
    queryB.set('name', 'foo');
    this.set('mockQueries', A([queryA, queryB]));

    await render(hbs`<QueriesTable @queries={{this.mockQueries}}/>`);
    assertTooltipNotRendered(assert);
    assert.dom('.lt-head .lt-column.is-sortable').exists({ count: 4 });
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[1]).includesText('foo');

    // Click twice for descending
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[1]);
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[1]);
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[1]).includesText('Mock BQL');
  });

  test('it sorts by the latest result column on click', async function(assert) {
    assert.expect(3);

    let queryA = MockQuery.create({ duration: 1 });
    queryA.set('name', 'bar');
    // 3 Results means its date will be Jan 4
    queryA.addResult([]);
    queryA.addResult([]);
    queryA.addResult([]);
    let queryB = MockQuery.create({ duration: 1 });
    queryB.set('name', 'foo');
    // Will be Jan 2
    queryB.addResult([]);

    this.set('mockQueries', A([queryA, queryB]));
    await render(hbs`<QueriesTable @queries={{this.mockQueries}}/>`);
    assertTooltipNotRendered(assert);
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[2]).hasText('04 Jan 12:00 AM');
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[2]);
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[2]).hasText('02 Jan 12:00 AM');
  });

  test('it sorts by the number of results column on click', async function(assert) {
    assert.expect(3);

    let queryA = MockQuery.create({ duration: 1 });
    queryA.set('name', 'bar');
    queryA.addResult([]);
    queryA.addResult([]);
    queryA.addResult([]);
    let queryB = MockQuery.create({ duration: 1 });
    queryB.set('name', 'foo');
    queryB.addResult([]);

    this.set('mockQueries', A([queryA, queryB]));
    await render(hbs`<QueriesTable @queries={{this.mockQueries}}/>`);
    assertTooltipNotRendered(assert);
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .length-entry')[0]).hasText('3 Results');
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[2]);
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .length-entry')[0]).hasText('1 Results');
  });

  test('it calls the queryClick action on clicking the query name', async function(assert) {
    assert.expect(1);

    let query = MockQuery.create({ duration: 1 });
    query.addResult([]);
    query.set('name', 'foo');
    this.set('mockQueries', A([query]));
    this.set('mockQueryClick', value => {
      assert.equal(value.get('name'), 'foo');
    });

    await render(hbs`<QueriesTable @queries={{this.mockQueries}} @queryClick={{this.mockQueryClick}}/>`);
    await click('.query-name-entry');
  });

  test('it calls the deleteQueryClick action on clicking the delete icon', async function(assert) {
    assert.expect(1);

    let query = MockQuery.create({ duration: 1 });
    query.addResult([]);
    query.set('name', 'foo');
    this.set('mockQueries', A([query]));
    this.set('mockDeleteQueryClick', value => {
      assert.equal(value.get('name'), 'foo');
    });

    await render(hbs`<QueriesTable @queries={{this.mockQueries}} @deleteQueryClick={{this.mockDeleteQueryClick}}/>`);
    await click('.query-name-entry .delete-icon');
  });

  test('it calls the deleteResultsClick action on clicking the clear results', async function(assert) {
    assert.expect(3);

    let query = MockQuery.create({ duration: 1 });
    query.addResult([]);
    query.set('name', 'foo');
    this.set('mockQueries', A([query]));
    this.set('mockDeleteResultsClick', value => {
      assert.equal(value.get('name'), 'foo');
    });

    await render(hbs`<QueriesTable @queries={{this.mockQueries}} @deleteResultsClick={{this.mockDeleteResultsClick}}/>`);
    assertTooltipNotRendered(assert);
    await click('.query-results-entry');
    assertTooltipRendered(assert);
    await click('.query-results-entry .clear-history');
  });

  test('it calls the resultsClick action on clicking the latest result', async function(assert) {
    assert.expect(1);

    let query = MockQuery.create({ duration: 1 });
    query.addResult([]);
    query.addResult([]);
    query.addResult([]);
    query.set('name', 'foo');
    this.set('mockQueries', A([query]));
    this.set('mockResultClick', value => {
      // Will be 4 since we added 3 results
      assert.equal(value.get('created').getDate(), 4);
    });

    await render(hbs`<QueriesTable @queries={{this.mockQueries}} @resultClick={{this.mockResultClick}}/>`);
    await click('.query-date-entry');
  });

  test('it calls the copyQueryClick action on clicking the copy icon', async function(assert) {
    assert.expect(1);

    let query = MockQuery.create({ duration: 1 });
    query.addResult([]);
    query.set('name', 'foo');
    this.set('mockQueries', A([query]));
    this.set('mockCopyQueryClick', value => {
      assert.equal(value.get('name'), 'foo');
    });

    await render(hbs`<QueriesTable @queries={{this.mockQueries}} @copyQueryClick={{this.mockCopyQueryClick}}/>`);
    await click('.query-name-entry .copy-icon');
  });

  test('it calls the linkQueryClick action on clicking the link icon', async function(assert) {
    assert.expect(1);

    let query = MockQuery.create({ duration: 1 });
    query.addResult([]);
    query.set('name', 'foo');
    this.set('mockQueries', A([query]));
    this.set('mockLinkQueryClick', value => {
      assert.equal(value.get('name'), 'foo');
    });

    await render(hbs`<QueriesTable @queries={{this.mockQueries}} @linkQueryClick={{this.mockLinkQueryClick}}/>`);
    await click('.query-name-entry .link-icon');
  });
});

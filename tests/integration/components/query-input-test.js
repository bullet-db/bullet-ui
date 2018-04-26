/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { Promise as EmberPromise } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import MockQuery from '../../helpers/mocked-query';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import MockColumn from '../../helpers/mocked-column';

let SIMPLE_SCHEMA = [MockColumn.create({ name: 'foo', type: 'STRING' })];

function getMockQuery() {
  let query = MockQuery.create({ promisify: true, duration: 1 });
  query.addFilter({ condition: 'AND', rules: [] });
  query.addAggregation(AGGREGATIONS.get('RAW'));
  return query;
}

module('Integration | Component | query input', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('mockSchema', SIMPLE_SCHEMA);
    await render(hbs`{{query-input schema=mockSchema}}`);

    let text = this.$().text().trim();
    assert.ok(text.indexOf('Filters') !== -1);
    assert.ok(text.indexOf('Output Data') !== -1);
    assert.ok(text.indexOf('Query Stop Criteria') !== -1);
    assert.ok(text.indexOf('Run Query') !== -1);
    assert.ok(text.indexOf('Save Query') !== -1);
  });

  test('it should ignore block content', async function(assert) {
    this.set('mockSchema', SIMPLE_SCHEMA);
    // It should ignore block content
    await render(hbs`
      {{#query-input schema=mockSchema}}
        template block text
      {{/query-input}}
    `);
    let text = this.$().text().trim();
    assert.ok(text.indexOf('template block text') === -1);
  });

  test('it displays the name of a query', async function(assert) {
    this.set('mockSchema', SIMPLE_SCHEMA);
    let query = MockQuery.create({ name: 'foo' });
    this.set('mockQuery', query);
    await render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);
    assert.equal(this.$('.query-name :input').val(), 'foo');
  });

  test('it displays the duration of a query', async function(assert) {
    this.set('mockSchema', SIMPLE_SCHEMA);
    let query = MockQuery.create({ duration: 1000 });
    this.set('mockQuery', query);
    await render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);
    assert.equal(this.$('.query-duration :input').val(), '1000');
  });

  test('it displays validation messages on saving if the query is not valid', async function(assert) {
    assert.expect(4);

    this.set('mockSchema', SIMPLE_SCHEMA);
    let query = getMockQuery();
    query.set('shouldValidate', false);
    this.set('mockQuery', query);
    await render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);

    assert.equal(this.$('.submit-button').prop('disabled'), false);
    await click('.save-button');

    let text = this.$('.validation-container').text();
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
    assert.ok(text.indexOf('OOPS') !== -1);
    assert.equal(this.$('.submit-button').prop('disabled'), false);
  });

  test('it displays validation messages on submitting if the query is not valid', async function(assert) {
    assert.expect(4);

    this.set('mockSchema', SIMPLE_SCHEMA);
    let query = getMockQuery();
    query.set('shouldValidate', false);
    this.set('mockQuery', query);
    await render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);

    assert.equal(this.$('.submit-button').prop('disabled'), false);
    await click('.submit-button');

    let text = this.$('.validation-container').text();
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
    assert.ok(text.indexOf('OOPS') !== -1);
    assert.equal(this.$('.submit-button').prop('disabled'), false);
  });

  test('it saves and triggers the fire query action on a good query', async function(assert) {
    assert.expect(6);

    this.set('mockSchema', SIMPLE_SCHEMA);
    let query = getMockQuery();

    this.set('mockQuery', query);
    this.set('mockSave', () => {
      // We should be saved if everything is ok.
      assert.ok(true);
      return EmberPromise.resolve();
    });
    this.set('mockFireQuery', () => {
      // We should be triggered if everything is ok.
      assert.ok(true);
      // There should be no validation messages
      assert.equal(this.$('.validation-container').text().trim(), '');
    });

    await render(
      hbs`{{query-input query=mockQuery schema=mockSchema save=mockSave fireQuery=(action mockFireQuery)}}`
    );

    assert.equal(this.$('.submit-button').prop('disabled'), false);

    await click('.submit-button');
    let text = this.$('.validation-container').text();
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
    assert.ok(text.indexOf('SAVED') !== -1);
  });

  test('it hides the save and submit button when listening', async function(assert) {
    assert.expect(5);

    this.set('mockSchema', SIMPLE_SCHEMA);
    let query = getMockQuery();

    this.set('mockQuery', query);
    this.set('mockSave', () => EmberPromise.resolve());

    await render(hbs`{{query-input query=mockQuery schema=mockSchema save=mockSave}}`);

    assert.ok(this.$('.submit-button').is(':visible'));
    assert.ok(this.$('.save-button').is(':visible'));

    await click('.submit-button');

    assert.notOk(this.$('.submit-button').is(':visible'));
    assert.notOk(this.$('.save-button').is(':visible'));
    assert.ok(this.$('.cancel-button').is(':visible'));
  });

  test('it triggers the cancel query action when cancelling', async function(assert) {
    assert.expect(6);

    this.set('mockSchema', SIMPLE_SCHEMA);
    let query = getMockQuery();

    this.set('mockQuery', query);
    this.set('mockSave', () => EmberPromise.resolve());
    this.set('mockFireQuery', () => {
      assert.ok(true);
    });
    this.set('mockCancelQuery', () => {
      assert.ok(true);
    });

    await render(
      hbs`{{query-input query=mockQuery schema=mockSchema save=mockSave fireQuery=(action mockFireQuery) cancelQuery=(action mockCancelQuery)}}`
    );

    assert.ok(this.$('.submit-button').is(':visible'));

    await click('.submit-button');
    assert.ok(this.$('.cancel-button').is(':visible'));
    await click('.cancel-button');
    let text = this.$('.validation-container').text();
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
    assert.ok(text.indexOf('CANCELLED') !== -1);
  });
});

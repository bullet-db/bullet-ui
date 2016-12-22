/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import MockQuery from '../../helpers/mocked-query';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import MockColumn from '../../helpers/mocked-column';

let SIMPLE_SCHEMA = [MockColumn.create({ name: 'foo', type: 'STRING' })];

function getMockSchema() {
  let schema = Ember.A();
  schema.pushObject(MockColumn.create({ name: 'foo', type: 'STRING' }));
  schema.pushObject(MockColumn.create({ name: 'bar', type: 'MAP', subtype: 'STRING', hasFreeformField: true }));
  let enumerated = MockColumn.create({ name: 'baz', type: 'MAP', subtype: 'DOUBLE' });
  enumerated.addEnumeration('qux');
  enumerated.addEnumeration('norf');
  schema.pushObject(enumerated);
  return schema;
}

function getMockQuery() {
  let query = MockQuery.create({ promisify: true, duration: 1 });
  query.addFilter({ condition: 'AND', rules: [] });
  query.addAggregation(AGGREGATIONS.get('LIMIT'));
  return query;
}

moduleForComponent('query-input', 'Integration | Component | query input', {
  integration: true
});

test('it renders', function(assert) {
  this.set('mockSchema', SIMPLE_SCHEMA);
  this.render(hbs`{{query-input schema=mockSchema }}`);

  let text = this.$().text().trim();
  assert.ok(text.indexOf('Filters') !== -1);
  assert.ok(text.indexOf('Result Data Fields') !== -1);
  assert.ok(text.indexOf('Query Stop Criteria') !== -1);
  assert.ok(text.indexOf('Run Query') !== -1);
  assert.ok(text.indexOf('Save Query') !== -1);
});

test('it should ignore block content', function(assert) {
  this.set('mockSchema', SIMPLE_SCHEMA);
  // It should ignore block content
  this.render(hbs`
    {{#query-input schema=mockSchema}}
      template block text
    {{/query-input}}
  `);
  let text = this.$().text().trim();
  assert.ok(text.indexOf('template block text') === -1);
});

test('it displays the name of a query', function(assert) {
  this.set('mockSchema', SIMPLE_SCHEMA);
  let query = MockQuery.create({ name: 'foo' });
  this.set('mockQuery', query);
  this.render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);
  assert.equal(this.$('.query-name :input').val(), 'foo');
});

test('it displays the duration of a query', function(assert) {
  this.set('mockSchema', SIMPLE_SCHEMA);
  let query = MockQuery.create({ duration: 1000 });
  this.set('mockQuery', query);
  this.render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);
  assert.equal(this.$('.query-duration :input').val(), '1000');
});

test('it displays two projection fields for a single projection', function(assert) {
  assert.expect(6);

  this.set('mockSchema', getMockSchema());
  let query = MockQuery.create({ duration: 1 });
  query.addProjection('foo', 'goo');

  this.set('mockQuery', query);
  this.render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);
  assert.equal(this.$('.projection-container').length, 1);
  assert.equal(this.$('.projection-container input').length, 1);
  assert.equal(this.$('.projection-field').length, 1);
  assert.equal(this.$('.projection-name').length, 1);
  assert.equal(this.$('.projection-field .column-onlyfield .ember-power-select').text().trim(), 'foo');
  assert.equal(this.$('.projection-name :input').val(), 'goo');
});

test('it displays multiple projections', function(assert) {
  assert.expect(8);

  this.set('mockSchema', getMockSchema());
  let query = MockQuery.create({ duration: 1 });
  query.addProjection('foo', 'goo');
  query.addProjection('baz.norf', 'norf');
  this.set('mockQuery', query);
  this.render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);

  assert.equal(this.$('.projection-container').length, 2);
  assert.equal(this.$('.projection-container input').length, 2);
  assert.equal(this.$('.projection-field').length, 2);
  assert.equal(this.$('.projection-name').length, 2);
  assert.equal(this.$('.projection-field .column-onlyfield .ember-power-select').first().text().trim(), 'foo');
  assert.equal(this.$('.projection-name :input').first().val(), 'goo');
  assert.equal(this.$('.projection-field  .column-onlyfield .ember-power-select').last().text().trim(), 'baz.norf');
  assert.equal(this.$('.projection-name :input').last().val(), 'norf');
});

test('it does not save unless the query is valid', function(assert) {
  assert.expect(1);

  this.set('mockSchema', SIMPLE_SCHEMA);
  let query = getMockQuery();
  query.set('shouldValidate', false);
  this.set('mockQuery', query);
  this.set('mockSave', () => {
    assert.ok(false, 'We should not save');
    return Ember.RSVP.Promise.resolve();
  });
  this.render(hbs`{{query-input query=mockQuery save=mockSave schema=mockSchema}}`);

  this.$('.save-button').click();
  return wait().then(() => {
    // We should have a validation message
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
  });
});

test('it displays validation messages on saving if the query is not valid', function(assert) {
  assert.expect(4);

  this.set('mockSchema', SIMPLE_SCHEMA);
  let query = getMockQuery();
  query.set('shouldValidate', false);
  this.set('mockQuery', query);
  this.render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);

  assert.equal(this.$('.submit-button').prop('disabled'), false);
  this.$('.save-button').click();

  return wait().then(() => {
    let text = this.$('.validation-container').text();
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
    assert.ok(text.indexOf('OOPS') !== -1);
    assert.equal(this.$('.submit-button').prop('disabled'), false);
  });
});

test('it displays validation messages on submitting if the query is not valid', function(assert) {
  assert.expect(4);

  this.set('mockSchema', SIMPLE_SCHEMA);
  let query = getMockQuery();
  query.set('shouldValidate', false);
  this.set('mockQuery', query);
  this.render(hbs`{{query-input query=mockQuery schema=mockSchema}}`);

  assert.equal(this.$('.submit-button').prop('disabled'), false);
  this.$('.submit-button').click();

  return wait().then(() => {
    let text = this.$('.validation-container').text();
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
    assert.ok(text.indexOf('OOPS') !== -1);
    assert.equal(this.$('.submit-button').prop('disabled'), false);
  });
});

test('it saves and triggers the fire query action on a good query', function(assert) {
  assert.expect(6);

  this.set('mockSchema', SIMPLE_SCHEMA);
  let query = getMockQuery();

  this.set('mockQuery', query);
  this.set('mockSave', () => {
    // We should be saved if everything is ok.
    assert.ok(true);
    return Ember.RSVP.Promise.resolve();
  });
  this.set('mockFireQuery', () => {
    // We should be triggered if everything is ok.
    assert.ok(true);
    // There should be no validation messages
    assert.equal(this.$('.validation-container').text().trim(), '');
  });

  this.render(hbs`{{query-input query=mockQuery schema=mockSchema save=mockSave fireQuery=(action mockFireQuery)}}`);

  assert.equal(this.$('.submit-button').prop('disabled'), false);

  this.$('.submit-button').click();
  return wait().then(() => {
    let text = this.$('.validation-container').text();
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
    assert.ok(text.indexOf('SAVED') !== -1);
  });
});

test('it hides the save and submit button when listening', function(assert) {
  assert.expect(5);

  this.set('mockSchema', SIMPLE_SCHEMA);
  let query = getMockQuery();

  this.set('mockQuery', query);
  this.set('mockSave', () => {
    return Ember.RSVP.Promise.resolve();
  });

  this.render(hbs`{{query-input query=mockQuery schema=mockSchema save=mockSave}}`);

  assert.ok(this.$('.submit-button').is(':visible'));
  assert.ok(this.$('.save-button').is(':visible'));

  this.$('.submit-button').click();

  return wait().then(() => {
    assert.notOk(this.$('.submit-button').is(':visible'));
    assert.notOk(this.$('.save-button').is(':visible'));
    assert.ok(this.$('.cancel-button').is(':visible'));
  });
});

test('it triggers the cancel query action when cancelling', function(assert) {
  assert.expect(6);

  this.set('mockSchema', SIMPLE_SCHEMA);
  let query = getMockQuery();

  this.set('mockQuery', query);
  this.set('mockSave', () => {
    return Ember.RSVP.Promise.resolve();
  });
  this.set('mockFireQuery', () => {
    assert.ok(true);
  });
  this.set('mockCancelQuery', () => {
    assert.ok(true);
  });

  this.render(hbs`{{query-input query=mockQuery schema=mockSchema save=mockSave fireQuery=(action mockFireQuery) cancelQuery=(action mockCancelQuery)}}`);

  assert.ok(this.$('.submit-button').is(':visible'));

  this.$('.submit-button').click();
  wait().then(() => {
    assert.ok(this.$('.cancel-button').is(':visible'));
    this.$('.cancel-button').click();
  });
  return wait().then(() => {
    let text = this.$('.validation-container').text();
    assert.equal(this.$('.validation-container .simple-alert').length, 1);
    assert.ok(text.indexOf('CANCELLED') !== -1);
  });
});

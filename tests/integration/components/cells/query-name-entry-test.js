/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import MockQuery from '../../../helpers/mocked-query';

moduleForComponent('query-name-entry', 'Integration | Component | Cell | query name entry', {
  integration: true
});

test('it displays the real name if it is available', function(assert) {
  this.set('mockRow', { name: 'foo' });
  this.render(hbs`{{cells/query-name-entry row=mockRow}}`);
  assert.ok(this.$().text(), 'foo');
});

test('it displays the summary if the name is not available', function(assert) {
  let query = MockQuery.create({ duration: 1 });
  query.addFilter({ }, 'An Actual Filter Summary');
  query.addProjection('foo', 'f');
  query.addProjection('bar', 'b');
  this.set('mockRow', query);

  this.render(hbs`{{cells/query-name-entry row=mockRow}}`);
  assert.ok(this.$().text(), 'Filters: An Actual Filter Summary Columns: f,b');
});

test('it calls the table action queryClick on click with a given query', function(assert) {
  assert.expect(1);
  let query = MockQuery.create({ duration: 1 });
  query.addProjection('foo', 'f');
  this.set('mockTableActions', {
    queryClick(value) {
      assert.equal(value, query);
    }
  });
  this.set('mockRow', query);

  this.render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
  this.$('.query-name-entry').click();
  return wait();
});

test('it adds a hasHover class on mouse enter', function(assert) {
  assert.expect(1);
  this.set('mockRow', { name: 'foo' });

  this.render(hbs`{{cells/query-name-entry row=mockRow}}`);
  this.$('.query-name-entry').mouseenter();
  return wait().then(() => {
    assert.ok(this.$('.query-name-actions').hasClass('is-visible'));
  });
});

test('it removes the hasHover class on mouse leave', function(assert) {
  assert.expect(2);
  this.set('mockRow', { name: 'foo' });

  this.render(hbs`{{cells/query-name-entry row=mockRow}}`);
  this.$('.query-name-entry').mouseenter();
  return wait().then(() => {
    assert.ok(this.$('.query-name-actions').hasClass('is-visible'));
    this.$('.query-name-entry').mouseleave();
    return wait().then(() => {
      assert.notOk(this.$('.query-name-actions').hasClass('is-visible'));
    });
  });
});

test('it calls the table action queryClick on clicking edit', function(assert) {
  assert.expect(1);
  let query = MockQuery.create({ duration: 1 });
  query.addProjection('foo', 'f');
  this.set('mockTableActions', {
    queryClick(value) {
      assert.equal(value, query);
    }
  });
  this.set('mockRow', query);

  this.render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
  this.$('.edit-icon').click();
  return wait();
});

test('it calls the table action deleteQueryClick on clicking delete', function(assert) {
  assert.expect(1);
  let query = MockQuery.create({ duration: 1 });
  query.addProjection('foo', 'f');
  this.set('mockTableActions', {
    deleteQueryClick(value) {
      assert.equal(value, query);
    }
  });
  this.set('mockRow', query);

  this.render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
  this.$('.delete-icon').click();
  return wait();
});

test('it calls the table action copyQueryClick on clicking copy', function(assert) {
  assert.expect(1);
  let query = MockQuery.create({ duration: 1 });
  query.addProjection('foo', 'f');
  this.set('mockTableActions', {
    copyQueryClick(value) {
      assert.equal(value, query);
    }
  });
  this.set('mockRow', query);

  this.render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
  this.$('.copy-icon').click();
  return wait();
});

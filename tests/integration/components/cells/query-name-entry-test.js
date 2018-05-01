/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import MockQuery from '../../../helpers/mocked-query';

module('Integration | Component | Cell | query name entry', function(hooks) {
  setupRenderingTest(hooks);

  function wrap(query) {
    return EmberObject.create({ content: query });
  }

  test('it displays the real name if it is available', async function(assert) {
    this.set('mockRow', wrap(MockQuery.create({ name: 'foo' })));
    await render(hbs`{{cells/query-name-entry row=mockRow}}`);
    assert.equal(this.$('.query-unsaved').length, 0);
    assert.ok(this.$().text(), 'foo');
  });

  test('it displays the summary if the name is not available', async function(assert) {
    let query = MockQuery.create({ duration: 1 });
    query.addFilter({ }, 'An Actual Filter Summary');
    query.addProjection('foo', 'f');
    query.addProjection('bar', 'b');
    this.set('mockRow', wrap(query));

    await render(hbs`{{cells/query-name-entry row=mockRow}}`);
    assert.equal(this.$('.query-unsaved').length, 0);
    assert.ok(this.$().text(), 'Filters: An Actual Filter Summary Columns: f,b');
  });

  test('it calls the table action queryClick on click with a given query', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      queryClick(value) {
        assert.equal(value.get('content'), query);
      }
    });
    this.set('mockRow', wrap(query));

    await render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
    await click('.query-name-entry');
  });

  test('it adds a hasHover class on mouse enter', async function(assert) {
    assert.expect(1);
    this.set('mockRow', wrap(MockQuery.create({ name: 'foo' })));

    await render(hbs`{{cells/query-name-entry row=mockRow}}`);
    await this.$('.query-name-entry').mouseenter();
    assert.ok(this.$('.query-name-actions').hasClass('is-visible'));
  });

  test('it removes the hasHover class on mouse leave', async function(assert) {
    assert.expect(2);
    this.set('mockRow', wrap(MockQuery.create({ name: 'foo' })));

    await render(hbs`{{cells/query-name-entry row=mockRow}}`);
    await this.$('.query-name-entry').mouseenter();
    assert.ok(this.$('.query-name-actions').hasClass('is-visible'));
    await this.$('.query-name-entry').mouseleave();
    assert.notOk(this.$('.query-name-actions').hasClass('is-visible'));
  });

  test('it calls the table action queryClick on clicking edit', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      queryClick(value) {
        assert.equal(value.get('content'), query);
      }
    });
    this.set('mockRow', wrap(query));

    await render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
    await click('.edit-icon');
  });

  test('it calls the table action deleteQueryClick on clicking delete', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      deleteQueryClick(value) {
        assert.equal(value.get('content'), query);
      }
    });
    this.set('mockRow', wrap(query));

    await render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
    await click('.delete-icon');
  });

  test('it calls the table action copyQueryClick on clicking copy', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      copyQueryClick(value) {
        assert.equal(value.get('content'), query);
      }
    });
    this.set('mockRow', wrap(query));

    await render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
    await click('.copy-icon');
  });

  test('it calls the table action linkQueryClick on clicking link', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      linkQueryClick(value) {
        assert.equal(value.get('content'), query);
      }
    });
    this.set('mockRow', wrap(query));

    await render(hbs`{{cells/query-name-entry tableActions=mockTableActions row=mockRow}}`);
    await click('.link-icon');
  });

  test('it displays an unsaved icon if the query is dirty', async function(assert) {
    let query = MockQuery.create({ duration: 1 });
    query.set('hasDirtyAttributes', true);
    query.set('hasUnsavedFields', false);
    this.set('mockRow', wrap(query));
    await render(hbs`{{cells/query-name-entry row=mockRow}}`);
    assert.equal(this.$('.query-unsaved').length, 1);
    assert.equal(this.$('.query-unsaved .glyphicon-alert').length, 1);
  });

  test('it displays an unsaved icon if the query has unsaved fields', async function(assert) {
    let query = MockQuery.create({ duration: 1 });
    query.set('hasDirtyAttributes', false);
    query.set('hasUnsavedFields', true);
    this.set('mockRow', wrap(query));
    await render(hbs`{{cells/query-name-entry row=mockRow}}`);
    assert.equal(this.$('.query-unsaved').length, 1);
    assert.equal(this.$('.query-unsaved .glyphicon-alert').length, 1);
  });

  test('it displays an unsaved icon if the query is invalid', async function(assert) {
    let query = MockQuery.create({ duration: 1, shouldValidate: false });
    query.set('hasDirtyAttributes', false);
    query.set('hasUnsavedFields', false);
    this.set('mockRow', wrap(query));
    await render(hbs`{{cells/query-name-entry row=mockRow}}`);
    assert.equal(this.$('.query-unsaved').length, 1);
    assert.equal(this.$('.query-unsaved .glyphicon-alert').length, 1);
  });

  test('it does not display an unsaved icon if the query is valid', async function(assert) {
    let query = MockQuery.create({ duration: 1 });
    query.set('hasDirtyAttributes', false);
    query.set('hasUnsavedFields', false);
    this.set('mockRow', wrap(query));
    await render(hbs`{{cells/query-name-entry row=mockRow}}`);
    assert.equal(this.$('.query-unsaved').length, 0);
  });
});

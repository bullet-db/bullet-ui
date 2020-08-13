/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import MockQuery from 'bullet-ui/tests/helpers/mocked-query';

module('Integration | Component | Cell | query name entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays the real name if it is available', async function(assert) {
    this.set('mockRow', MockQuery.create({ name: 'foo' }));
    await render(hbs`<Cells::QueryNameEntry @row={{this.mockRow}}/>`);
    assert.dom(this.element).hasText('foo');
  });

  test('it displays the summary if the name is not available', async function(assert) {
    let query = MockQuery.create({ duration: 1 });
    query.addFilter({ }, 'An Actual Filter Summary');
    query.addProjection('foo', 'f');
    query.addProjection('bar', 'b');
    this.set('mockRow', query);

    await render(hbs`<Cells::QueryNameEntry @row={{this.mockRow}}/>`);
    assert.dom(this.element).hasText('Filters: An Actual Filter Summary Fields: fb Window: None');
  });

  test('it calls the table action queryClick on click with a given query', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      queryClick(value) {
        assert.equal(value, query);
      }
    });
    this.set('mockRow', query);

    await render(hbs`<Cells::QueryNameEntry @tableActions={{this.mockTableActions}} @row={{this.mockRow}}/>`);
    await click('.query-name-entry');
  });

  test('it adds a hasHover class on mouse enter', async function(assert) {
    assert.expect(1);
    this.set('mockRow', MockQuery.create({ name: 'foo' }));

    await render(hbs`<Cells::QueryNameEntry @row={{this.mockRow}}/>`);
    await triggerEvent('.query-name-entry', 'mouseenter');
    assert.dom(this.element.querySelector('.query-name-actions')).hasClass('is-visible');
  });

  test('it removes the hasHover class on mouse leave', async function(assert) {
    assert.expect(2);
    this.set('mockRow', MockQuery.create({ name: 'foo' }));

    await render(hbs`<Cells::QueryNameEntry @row={{this.mockRow}}/>`);
    await triggerEvent('.query-name-entry', 'mouseenter');
    assert.dom(this.element.querySelector('.query-name-actions')).hasClass('is-visible');
    await triggerEvent('.query-name-entry', 'mouseleave');
    assert.dom(this.element.querySelector('.query-name-actions')).hasNoClass('is-visible');
  });

  test('it calls the table action queryClick on clicking edit', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      queryClick(value) {
        assert.equal(value, query);
      }
    });
    this.set('mockRow', query);

    await render(hbs`<Cells::QueryNameEntry @tableActions={{this.mockTableActions}} @row={{this.mockRow}}/>`);
    await click('.edit-icon');
  });

  test('it calls the table action deleteQueryClick on clicking delete', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      deleteQueryClick(value) {
        assert.equal(value, query);
      }
    });
    this.set('mockRow', query);

    await render(hbs`<Cells::QueryNameEntry @tableActions={{this.mockTableActions}} @row={{this.mockRow}}/>`);
    await click('.delete-icon');
  });

  test('it calls the table action copyQueryClick on clicking copy', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      copyQueryClick(value) {
        assert.equal(value, query);
      }
    });
    this.set('mockRow', query);

    await render(hbs`<Cells::QueryNameEntry @tableActions={{this.mockTableActions}} @row={{this.mockRow}}/>`);
    await click('.copy-icon');
  });

  test('it calls the table action linkQueryClick on clicking link', async function(assert) {
    assert.expect(1);
    let query = MockQuery.create({ duration: 1 });
    query.addProjection('foo', 'f');
    this.set('mockTableActions', {
      linkQueryClick(value) {
        assert.equal(value, query);
      }
    });
    this.set('mockRow', query);

    await render(hbs`<Cells::QueryNameEntry @tableActions={{this.mockTableActions}} @row={{this.mockRow}}/>`);
    await click('.link-icon');
  });
});

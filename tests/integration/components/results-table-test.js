/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | results table', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a row with two cells in two columns', async function(assert) {
    assert.expect(4);
    this.set('mockResults', A([
      EmberObject.create({ created: new Date(2014, 11, 31), windows: A([{ }, { }, { }]) })
    ]));
    this.set('mockResultClick', () => { });
    await render(hbs`<ResultsTable @results={{this.mockResults}} @resultClick={{this.mockResultClick}}/>`);
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[0]).hasText('Date');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[1]).hasText('# Windows');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[0]).hasText('31 Dec 12:00 AM');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[1]).hasText('3');
  });

  test('it sorts by the number of windows column on click', async function(assert) {
    assert.expect(3);
    this.set('mockResults', A([
      EmberObject.create({ created: new Date(2014, 11, 31), windows: A([{ }, { }, { }]) }),
      EmberObject.create({ created: new Date(2015, 1, 1), windows: A() })
    ]));
    this.set('mockResultClick', () => { });
    await render(hbs`<ResultsTable @results={{this.mockResults}} @resultClick={{this.mockResultClick}}/>`);
    assert.dom('.lt-head .lt-column.is-sortable').exists({ count:  2 });
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[1]);
    assert.dom(this.element.querySelectorAll('.lt-row')[0]).hasText('01 Feb 12:00 AM 0');
    assert.dom(this.element.querySelectorAll('.lt-row')[1]).hasText('31 Dec 12:00 AM 3');
  });

  test('it sorts by the date column on click', async function(assert) {
    assert.expect(3);
    this.set('mockResults', A([
      EmberObject.create({ created: new Date(2015, 1, 1), windows: A() }),
      EmberObject.create({ created: new Date(2014, 11, 31), windows: A([{ }, { }, { }]) })
    ]));
    this.set('mockResultClick', () => { });
    await render(hbs`<ResultsTable @results={{this.mockResults}} @resultClick={{this.mockResultClick}}/>`);
    assert.dom('.lt-head .lt-column.is-sortable').exists({ count: 2 });
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[0]);
    assert.dom(this.element.querySelectorAll('.lt-row')[0]).hasText('31 Dec 12:00 AM 3');
    assert.dom(this.element.querySelectorAll('.lt-row')[1]).hasText('01 Feb 12:00 AM 0');
  });

  test('it sends the resultClick action on click', async function(assert) {
    assert.expect(2);
    this.set('mockResultClick', result => {
      assert.equal(result.get('windows.length'), 3);
    });
    this.set('mockResults', A([
      EmberObject.create({ created: new Date(2015, 1, 1), windows: A() }),
      EmberObject.create({ created: new Date(2014, 11, 31), windows: A([{ }, { }, { }]) })
    ]));
    await render(hbs`<ResultsTable @results={{this.mockResults}} @resultClick={{this.mockResultClick}}/>`);
    assert.dom('.lt-head .lt-column.is-sortable').exists({ count: 2 });
    await click(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .result-date-entry')[1]);
  });
});

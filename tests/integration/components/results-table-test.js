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
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | results table', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays a row with two cells in two columns', async function(assert) {
    assert.expect(4);
    this.set('mockResults', A([
      EmberObject.create({ created: new Date(2014, 11, 31), segments: A([{ }, { }, { }]) })
    ]));
    await render(hbs`{{results-table results=mockResults}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column')[0].textContent.trim(), 'Date');
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column')[1].textContent.trim(), '# Windows');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[0].textContent.trim(), '31 Dec 12:00 AM');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell')[1].textContent.trim(), '3');
  });

  test('it sorts by the number of windows column on click', async function(assert) {
    assert.expect(2);
    this.set('mockResults', A([
      EmberObject.create({ created: new Date(2014, 11, 31), segments: A([{ }, { }, { }]) }),
      EmberObject.create({ created: new Date(2015, 1, 1), segments: A() })
    ]));
    await render(hbs`{{results-table results=mockResults}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column.is-sortable').length, 2);
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[1]);
    let text = this.element.querySelector('.lt-body').textContent;
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '01Feb12:00AM031Dec12:00AM3');
  });

  test('it sorts by the date column on click', async function(assert) {
    assert.expect(2);
    this.set('mockResults', A([
      EmberObject.create({ created: new Date(2015, 1, 1), segments: A() }),
      EmberObject.create({ created: new Date(2014, 11, 31), segments: A([{ }, { }, { }]) })
    ]));
    await render(hbs`{{results-table results=mockResults}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column.is-sortable').length, 2);
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[0]);
    let text = this.element.querySelector('.lt-body').textContent;
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '31Dec12:00AM301Feb12:00AM0');
  });

  test('it sends the resultClick action on click', async function(assert) {
    assert.expect(2);
    this.set('mockResultClick', result => {
      assert.equal(result.get('segments.length'), 3);
    });
    this.set('mockResults', A([
      EmberObject.create({ created: new Date(2015, 1, 1), segments: A() }),
      EmberObject.create({ created: new Date(2014, 11, 31), segments: A([{ }, { }, { }]) })
    ]));
    await render(hbs`{{results-table results=mockResults resultClick=(action mockResultClick)}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column.is-sortable').length, 2);
    await click(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .result-date-entry')[1]);
  });
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import MockColumn from '../../helpers/mocked-column';

module('Integration | Component | schema table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the name, type and description of columns', async function(assert) {
    let column = MockColumn.create({ name: 'foo', type: 'STRING', description: 'description' });
    let columns = A([column]);
    this.set('mockColumns', columns);

    await render(hbs`{{schema-table fields=mockColumns}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column')[0].textContent.trim(), 'Field');
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column')[1].textContent.trim(), 'Type');
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column')[2].textContent.trim(), 'Description');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row').length, 1);
    assert.equal(this.element.querySelector('.lt-body .lt-row .lt-cell .schema-name-entry').textContent.trim(), 'foo');
    assert.equal(this.element.querySelector('.lt-body .lt-row .lt-cell .schema-type-entry').textContent.trim(), 'STRING');
    assert.equal(this.element.querySelector('.lt-body .lt-row .lt-cell .schema-description-entry').textContent.trim(), 'description');
  });

  test('it does not expand non-complex columns', async function(assert) {
    let column = MockColumn.create({ name: 'foo', type: 'MAP', subtype: 'BOOLEAN', description: 'description' });
    let columns = A([column]);
    this.set('mockColumns', columns);

    await render(hbs`{{schema-table fields=mockColumns}}`);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row').length, 1);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row').length, 0);

    await click('.lt-body .lt-row');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row').length, 0);
  });

  test('it renders and expands complex columns', async function(assert) {
    let column = MockColumn.create({ name: 'foo', type: 'MAP', subtype: 'BOOLEAN', description: 'description' });
    column.addEnumeration('bar', 'nested 1');
    column.addEnumeration('baz', 'nested 2');
    let columns = A([column]);
    this.set('mockColumns', columns);

    await render(hbs`{{schema-table fields=mockColumns}}`);
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column')[0].textContent.trim(), 'Field');
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column')[1].textContent.trim(), 'Type');
    assert.equal(this.element.querySelectorAll('.lt-head .lt-column')[2].textContent.trim(), 'Description');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row.has-enumerations').length, 1);

    assert.equal(this.element.querySelector('.lt-body .lt-row .lt-cell .schema-name-entry').textContent.trim(), 'foo');
    assert.equal(this.element.querySelector('.lt-body .lt-row .lt-cell .schema-type-entry').textContent.trim(), 'MAP OF BOOLEANS');
    assert.equal(this.element.querySelector('.lt-body .lt-row .lt-cell .schema-description-entry').textContent.trim(), 'description');

    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row').length, 0);

    await click('.lt-body .lt-row');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row').length, 1);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row .schema-table.is-nested').length, 1);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row .schema-table .lt-row').length, 2);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[0].textContent.trim(), 'bar');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[0].textContent.trim(), 'BOOLEAN');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[0].textContent.trim(), 'nested 1');

    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[1].textContent.trim(), 'baz');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[1].textContent.trim(), 'BOOLEAN');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[1].textContent.trim(), 'nested 2');
  });

  test('it default sorts by name ascending and can sort', async function(assert) {
    let columnA = MockColumn.create({ name: 'foo', type: 'STRING', description: 'description' });
    let columnB = MockColumn.create({ name: 'bar', type: 'STRING', description: 'description' });
    let columnC = MockColumn.create({ name: 'qux', type: 'STRING', description: 'description' });
    let columns = A([columnA, columnB, columnC]);
    this.set('mockColumns', columns);

    await render(hbs`{{schema-table fields=mockColumns}}`);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row').length, 3);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[0].textContent.trim(), 'bar');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[1].textContent.trim(), 'foo');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[2].textContent.trim(), 'qux');

    // Click twice for descending sort
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[0]);
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[0]);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row').length, 3);
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[0].textContent.trim(), 'qux');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[1].textContent.trim(), 'foo');
    assert.equal(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[2].textContent.trim(), 'bar');
  });
});

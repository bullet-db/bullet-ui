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
import MockColumn from 'bullet-ui/tests/helpers/mocked-column';

module('Integration | Component | schema table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the name, type and description of columns', async function(assert) {
    let column = new MockColumn({ name: 'foo', type: 'STRING', description: 'description' });
    let columns = A([column]);
    this.set('mockColumns', columns);

    await render(hbs`<SchemaTable @fields={{this.mockColumns}}/>`);
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[0]).hasText('Field');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[1]).hasText('Type');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[2]).hasText('Description');
    assert.dom('.lt-body .lt-row').exists({ count: 1 });
    assert.dom('.lt-body .lt-row .lt-cell .schema-name-entry').hasText('foo');
    assert.dom('.lt-body .lt-row .lt-cell .schema-type-entry').hasText('STRING');
    assert.dom('.lt-body .lt-row .lt-cell .schema-description-entry').hasText('description');
  });

  test('it does not expand non-complex columns', async function(assert) {
    let column = new MockColumn({ name: 'foo', type: 'BOOLEAN_MAP', description: 'description' });
    let columns = A([column]);
    this.set('mockColumns', columns);

    await render(hbs`<SchemaTable @fields={{this.mockColumns}}/>`);
    assert.dom('.lt-body .lt-row').exists({ count: 1 });
    assert.dom('.lt-body .lt-expanded-row').doesNotExist();
    await click('.lt-body .lt-row');
    assert.dom('.lt-body .lt-expanded-row').doesNotExist();
  });

  test('it renders and expands complex columns', async function(assert) {
    let column = new MockColumn({ name: 'foo', type: 'BOOLEAN_MAP', description: 'description' });
    column.addEnumeration('bar', 'nested 1');
    column.addEnumeration('baz', 'nested 2');
    let columns = A([column]);
    this.set('mockColumns', columns);

    await render(hbs`<SchemaTable @fields={{this.mockColumns}}/>`);
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[0]).hasText('Field');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[1]).hasText('Type');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[2]).hasText('Description');
    assert.dom('.lt-body .lt-row.has-enumerations').exists({ count: 1 });

    assert.dom('.lt-body .lt-row .lt-cell .schema-name-entry').hasText('foo');
    assert.dom('.lt-body .lt-row .lt-cell .schema-type-entry').hasText('MAP OF BOOLEANS');
    assert.dom('.lt-body .lt-row .lt-cell .schema-description-entry').hasText('description');
    assert.dom('.lt-body .lt-expanded-row').doesNotExist();

    await click('.lt-body .lt-row');
    assert.dom('.lt-body .lt-expanded-row').exists({ count: 1 });
    assert.dom('.lt-body .lt-expanded-row .schema-table.is-nested').exists({ count: 1 });
    assert.dom('.lt-body .lt-expanded-row .schema-table .lt-row').exists({ count: 2 });
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[0]).hasText('bar');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[0]).hasText('BOOLEAN');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[0]).hasText('nested 1');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[1]).hasText('baz');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[1]).hasText('BOOLEAN');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[1]).hasText('nested 2');
  });

  test('it default sorts by name ascending and can sort', async function(assert) {
    let columnA = new MockColumn({ name: 'foo', type: 'STRING', description: 'description' });
    let columnB = new MockColumn({ name: 'bar', type: 'STRING', description: 'description' });
    let columnC = new MockColumn({ name: 'qux', type: 'STRING', description: 'description' });
    let columns = A([columnA, columnB, columnC]);
    this.set('mockColumns', columns);

    await render(hbs`<SchemaTable @fields={{this.mockColumns}}/>`);
    assert.dom('.lt-body .lt-row').exists({ count: 3 });
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[0]).hasText('bar');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[1]).hasText('foo');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[2]).hasText('qux');

    // Click twice for descending sort
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[0]);
    await click(this.element.querySelectorAll('.lt-head .lt-column.is-sortable')[0]);
    assert.dom('.lt-body .lt-row').exists({ count: 3 });
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[0]).hasText('qux');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[1]).hasText('foo');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-row .lt-cell .schema-name-entry')[2]).hasText('bar');
  });
});

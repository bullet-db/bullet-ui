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
import { findIn } from 'bullet-ui/tests/helpers/find-helpers';

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
    let columnA = new MockColumn({ name: 'foo', type: 'BOOLEAN_MAP_MAP', description: 'description 1' });
    columnA.addMapEnumeration('bar', 'nested 1');
    columnA.addMapEnumeration('baz', 'nested 2');
    columnA.addSubMapEnumeration('qux', 'double nested 1');
    columnA.addSubMapEnumeration('norf', 'double nested 2');
    let columnB = new MockColumn({ name: 'goo', type: 'STRING_MAP_LIST', description: 'description 2' });
    columnB.addSubListEnumeration('foo', 'double nested 3');
    let columns = A([columnA, columnB]);
    this.set('mockColumns', columns);

    await render(hbs`<SchemaTable @fields={{this.mockColumns}}/>`);
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[0]).hasText('Field');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[1]).hasText('Type');
    assert.dom(this.element.querySelectorAll('.lt-head .lt-column')[2]).hasText('Description');
    assert.dom('.lt-body .lt-row.has-enumerations').exists({ count: 2 });

    let rowA = this.element.querySelectorAll('.lt-body .lt-row')[0];
    assert.dom(findIn('.lt-cell .schema-name-entry', rowA)).hasText('foo');
    assert.dom(findIn('.lt-cell .schema-type-entry', rowA)).hasText('MAP<STRING, MAP<STRING, BOOLEAN>>');
    assert.dom(findIn('.lt-cell .schema-description-entry', rowA)).hasText('description 1');

    assert.dom('.lt-body .lt-expanded-row').doesNotExist();
    await click(rowA);
    assert.dom('.lt-body .lt-expanded-row').exists({ count: 1 });
    assert.dom('.lt-body .lt-expanded-row .schema-table.is-nested').exists({ count: 1 });
    assert.dom('.lt-body .lt-expanded-row .schema-table .lt-row').exists({ count: 4 });
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[0]).hasText('bar');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[0]).hasText('MAP<STRING, BOOLEAN>');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[0]).hasText('nested 1');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[1]).hasText('baz');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[1]).hasText('MAP<STRING, BOOLEAN>');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[1]).hasText('nested 2');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[2]).hasText('qux');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[2]).hasText('BOOLEAN');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[2]).hasText('double nested 1');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[3]).hasText('norf');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[3]).hasText('BOOLEAN');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[3]).hasText('double nested 2');

    await click(rowA);
    assert.dom('.lt-body .lt-expanded-row').doesNotExist();

    let rowB = this.element.querySelectorAll('.lt-body .lt-row')[1];
    assert.dom(findIn('.lt-cell .schema-name-entry', rowB)).hasText('goo');
    assert.dom(findIn('.lt-cell .schema-type-entry', rowB)).hasText('LIST<MAP<STRING, STRING>>');
    assert.dom(findIn('.lt-cell .schema-description-entry', rowB)).hasText('description 2');
    await click(rowB);
    assert.dom('.lt-body .lt-expanded-row').exists({ count: 1 });
    assert.dom('.lt-body .lt-expanded-row .schema-table.is-nested').exists({ count: 1 });
    assert.dom('.lt-body .lt-expanded-row .schema-table .lt-row').exists({ count: 1 });
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-name-entry')[0]).hasText('foo');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-type-entry')[0]).hasText('STRING');
    assert.dom(this.element.querySelectorAll('.lt-body .lt-expanded-row .lt-cell .schema-description-entry')[0]).hasText('double nested 3');
  });

  test('it default sorts by name ascending for top level schema and can sort', async function(assert) {
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

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import PaginatedTableMixin from 'bullet-ui/mixins/paginated-table';
import { module, test } from 'qunit';

module('Unit | Mixin | paginated table', function() {
  test('it uses the default string extractor for unknown objects', function(assert) {
    let PaginatedTableObject = EmberObject.extend(PaginatedTableMixin);
    let subject = PaginatedTableObject.create();
    subject.set('useDefaultStringExtractor', false);

    let extractor = subject.getExtractor('foo');
    let row = EmberObject.create({ foo: [1, 2, 3] });
    let result = extractor(row);
    assert.equal(result, String([1, 2, 3]));
  });

  test('it sorts by direction', function(assert) {
    let PaginatedTableObject = EmberObject.extend(PaginatedTableMixin);
    let rows = [
      EmberObject.create({ a: 4, b: 'foo', c: false, d: [1, 2] }),
      EmberObject.create({ a: 2, b: 'bar', c: true, d: [2, 1] }),
      EmberObject.create({ a: -1, b: 'baz', c: null })
    ];
    let subject = PaginatedTableObject.create({ rows });
    subject.set('useDefaultStringExtractor', false);

    subject.sortBy('a', 'ascending');
    assert.equal(rows[0].get('a'), -1);
    assert.equal(rows[1].get('a'), 2);
    assert.equal(rows[2].get('a'), 4);

    subject.sortBy('c', 'descending');
    assert.equal(rows[0].get('c'), null);
    assert.equal(rows[1].get('c'), true);
    assert.equal(rows[2].get('c'), false);

    subject.sortBy('d', 'ascending');
    // d is converted to string and sorted as string
    assert.equal(rows[0].get('a'), 4);
    assert.equal(rows[1].get('a'), 2);
    assert.equal(rows[2].get('a'), -1);
  });

  test('it can paginate a table', function(assert) {
    let PaginatedTableObject = EmberObject.extend(PaginatedTableMixin);
    let rows = Array(100).fill().map((_, i) => i + 1);
    let table = EmberObject.create({
      setRows(rows) {
        this.set('rows', rows);
      },

      addRows(rows) {
        this.setRows(rows);
      }
    });
    let pageSize = 10;

    let subject = PaginatedTableObject.create({ rows, table, pageSize });

    assert.equal(subject.get('firstNewRow'), 0);

    subject.addPages(1);
    assert.equal(subject.get('firstNewRow'), 10);
    assert.equal(subject.get('table.rows.length'), 10);
    assert.equal(subject.get('table.rows')[0], 1);
    assert.equal(subject.get('table.rows')[9], 10);

    subject.addPages(4);
    assert.equal(subject.get('firstNewRow'), 50);
    assert.equal(subject.get('table.rows.length'), 40);
    assert.equal(subject.get('table.rows')[0], 11);
    assert.equal(subject.get('table.rows')[39], 50);

    subject.reset();
    assert.equal(subject.get('firstNewRow'), 0);
    assert.equal(subject.get('table.rows.length'), 0);
  });
});

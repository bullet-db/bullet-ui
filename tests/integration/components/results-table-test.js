/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('results-table', 'Integration | Component | results table', {
  integration: true
});

test('it displays a row with two cells in two columns', function(assert) {
  assert.expect(4);
  this.set('mockResults', A([
                            EmberObject.create({ created: new Date(2014, 11, 31), records: A([1, 2, 3]) })
                           ]));
  this.render(hbs`{{results-table results=mockResults}}`);
  assert.equal(this.$('.lt-head .lt-column').eq(0).text().trim(), 'Date');
  assert.equal(this.$('.lt-head .lt-column').eq(1).text().trim(), '# Records');
  assert.equal(this.$('.lt-body .lt-row .lt-cell').eq(0).text().trim(), '31 Dec 12:00 AM');
  assert.equal(this.$('.lt-body .lt-row .lt-cell').eq(1).text().trim(), '3');
});

test('it sorts by the number of records column on click', function(assert) {
  assert.expect(2);
  this.set('mockResults', A([
                            EmberObject.create({ created: new Date(2014, 11, 31), records: A([1, 2, 3]) }),
                            EmberObject.create({ created: new Date(2015, 1, 1), records: A() })
                           ]));
  this.render(hbs`{{results-table results=mockResults}}`);
  assert.equal(this.$('.lt-head .lt-column.is-sortable').length, 2);
  this.$('.lt-head .lt-column.is-sortable').eq(1).click();
  return wait().then(() => {
    let text = this.$('.lt-body .lt-row .lt-cell').text();
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '01Feb12:00AM031Dec12:00AM3');
  });
});

test('it sorts by the date column on click', function(assert) {
  assert.expect(2);
  this.set('mockResults', A([
                            EmberObject.create({ created: new Date(2015, 1, 1), records: A() }),
                            EmberObject.create({ created: new Date(2014, 11, 31), records: A([1, 2, 3]) })
                           ]));
  this.render(hbs`{{results-table results=mockResults}}`);
  assert.equal(this.$('.lt-head .lt-column.is-sortable').length, 2);
  this.$('.lt-head .lt-column.is-sortable').eq(0).click();
  return wait().then(() => {
    let text = this.$('.lt-body .lt-row .lt-cell').text();
    let spaceLess = text.replace(/\s/g, '');
    assert.equal(spaceLess, '31Dec12:00AM301Feb12:00AM0');
  });
});

test('it sends the resultClick action on click', function(assert) {
  assert.expect(2);
  this.set('mockResultClick', (result) => {
    assert.equal(result.get('records.length'), 3);
  });
  this.set('mockResults', A([
                            EmberObject.create({ created: new Date(2015, 1, 1), records: A() }),
                            EmberObject.create({ created: new Date(2014, 11, 31), records: A([1, 2, 3]) })
                           ]));
  this.render(hbs`{{results-table results=mockResults resultClick=(action mockResultClick)}}`);
  assert.equal(this.$('.lt-head .lt-column.is-sortable').length, 2);
  this.$('.lt-body .lt-row .lt-cell .result-date-entry').eq(1).click();
  return wait();
});

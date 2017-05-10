/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import RESULTS from '../../fixtures/results';

moduleForComponent('pivot-table', 'Integration | Component | pivot table', {
  integration: true
});

test('it renders a pivot table', function(assert) {
  assert.expect(1);
  this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
  this.set('mockColumns', ['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']);
  this.set('mockOnRefresh', () => { });

  this.render(hbs`{{pivot-table rows=mockRows columns=mockColumns initialOptions=mockOptions
                                onRefresh=(action mockOnRefresh)}}`);
  assert.equal(this.$('.pvtUi select.pvtRenderer').val(), 'Table');
});

test('it generates options by combining defaults with provided options', function(assert) {
  assert.expect(1);
  this.set('mockOnRefresh', (config) => {
    assert.equal(config.rendererName, 'Heatmap');
  });
  this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
  this.set('mockColumns', ['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']);
  this.set('mockOptions', { rendererName: 'Heatmap' });

  this.render(hbs`{{pivot-table rows=mockRows columns=mockColumns initialOptions=mockOptions
                                onRefresh=(action mockOnRefresh)}}`);
});

test('it removes certain options before returning the configuration', function(assert) {
  assert.expect(4);
  this.set('mockOnRefresh', (config) => {
    assert.notOk(config.localeStrings);
    assert.notOk(config.aggregators);
    assert.notOk(config.renderers);
    assert.notOk(config.rendererOptions);
  });
  this.set('mockRows', RESULTS.GROUP_MULTIPLE_METRICS.records);
  this.set('mockColumns', ['foo', 'bar', 'COUNT', 'avg_bar', 'sum_foo']);
  this.set('mockOptions', { rendererOptions: { foo: 'bar' }, localeStrings: { bar: 'foo' } });

  this.render(hbs`{{pivot-table rows=mockRows columns=mockColumns initialOptions=mockOptions
                                onRefresh=(action mockOnRefresh)}}`);
});

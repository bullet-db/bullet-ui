/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Cell | query results entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the empty state when there are no results', async function(assert) {
    await render(hbs`{{cells/query-results-entry}}`);
    assert.dom(this.element).hasText('--');
  });

  test('it renders the run count if there were results', async function(assert) {
    this.set('mockValue', A([EmberObject.create({ foo: 2 })]));
    await render(hbs`{{cells/query-results-entry value=mockValue}}`);
    assert.dom(this.element.querySelector('.length-entry')).hasText('1 Results');
  });
});

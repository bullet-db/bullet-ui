/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Cell | date entry', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders an empty date text when there is no date provided', async function(assert) {
    await render(hbs`<Cells::DateEntry/>`);
    assert.dom(this.element).hasText('--');

    await render(hbs`
      <Cells::DateEntry>
        template block text
      </Cells::DateEntry>
    `);
    assert.dom(this.element).hasText('--');
  });

  test('it renders a date in the default format', async function(assert) {
    this.set('date', new Date(2016, 8, 1, 3, 16));
    await render(hbs`<Cells::DateEntry @value={{this.date}}/>`);
    assert.dom(this.element).hasText('01 Sep 03:16 AM');
  });


  test('it renders a date in the given format', async function(assert) {
    this.set('date', new Date(2016, 8, 1, 3, 16));
    await render(hbs`<Cells::DateEntry @value={{this.date}} @format='D/M HH:m'/>`);

    assert.dom(this.element).hasText('1/9 03:16');
  });
});

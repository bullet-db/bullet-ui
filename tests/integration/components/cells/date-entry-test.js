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
    await render(hbs`{{cells/date-entry}}`);

    assert.equal(this.element.textContent.trim(), '--');

    await render(hbs`
      {{#cells/date-entry}}
        template block text
      {{/cells/date-entry}}
    `);

    assert.equal(this.element.textContent.trim(), '--');
  });

  test('it renders a date in the default format', async function(assert) {
    this.set('date', new Date(2016, 8, 1, 3, 16));
    await render(hbs`{{cells/date-entry value=date}}`);

    assert.equal(this.element.textContent.trim(), '01 Sep 03:16 AM');
  });


  test('it renders a date in the given format', async function(assert) {
    this.set('date', new Date(2016, 8, 1, 3, 16));
    await render(hbs`{{cells/date-entry value=date format='D/M HH:m'}}`);

    assert.equal(this.element.textContent.trim(), '1/9 03:16');
  });
});

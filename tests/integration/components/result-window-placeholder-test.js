import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('result-window-placeholder', 'Integration | Component | result window placeholder', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{result-window-placeholder}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#result-window-placeholder}}
      template block text
    {{/result-window-placeholder}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});

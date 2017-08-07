import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('records-raw-viewer', 'Integration | Component | records raw viewer', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{records-raw-viewer}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#records-raw-viewer}}
      template block text
    {{/records-raw-viewer}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});

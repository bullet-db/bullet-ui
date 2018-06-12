import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('transform:segment-array', 'Unit | Transform | segment array', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let transform = this.owner.lookup('transform:segment-array');
    assert.ok(transform);
  });
});

import { moduleFor, test } from 'ember-qunit';

moduleFor('validator:points', 'Unit | Validator | points', {
  needs: ['validator:messages']
});

test('it works', function(assert) {
  var validator = this.subject();
  assert.ok(validator);
});

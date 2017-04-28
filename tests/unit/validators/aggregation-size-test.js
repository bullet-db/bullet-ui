import { moduleFor, test } from 'ember-qunit';

moduleFor('validator:aggregation-size', 'Unit | Validator | aggregation-size', {
  needs: ['validator:messages']
});

test('it works', function(assert) {
  var validator = this.subject();
  assert.ok(validator);
});

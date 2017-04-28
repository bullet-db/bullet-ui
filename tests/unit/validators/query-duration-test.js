import { moduleFor, test } from 'ember-qunit';

moduleFor('validator:query-duration', 'Unit | Validator | query-duration', {
  needs: ['validator:messages']
});

test('it works', function(assert) {
  var validator = this.subject();
  assert.ok(validator);
});

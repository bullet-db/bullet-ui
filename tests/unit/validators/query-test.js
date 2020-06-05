import { module, test } from 'qunit';
import validateQuery from 'bullet-ui/validators/query';

module('Unit | Validator | query');

test('it exists', function(assert) {
  assert.ok(validateQuery());
});

import EmberObject from '@ember/object';
import QueryableMixin from 'bullet-ui/mixins/queryable';
import { module, test } from 'qunit';

module('Unit | Mixin | queryable');

// Replace this with your real tests.
test('it works', function(assert) {
  let QueryableObject = EmberObject.extend(QueryableMixin);
  let subject = QueryableObject.create();
  assert.ok(subject);
});

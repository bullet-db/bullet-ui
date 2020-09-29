/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import { visit, currentRouteName, click, fillIn, find, findAll } from '@ember/test-helpers';
import { findIn } from 'bullet-ui/tests/helpers/find-helpers';
import { setupForAcceptanceTest, setupForMockSettings } from 'bullet-ui/tests/helpers/setup-for-acceptance-test';
import RESULTS from 'bullet-ui/tests/fixtures/results';
import COLUMNS from 'bullet-ui/tests/fixtures/columns';
import QUERIES from 'bullet-ui/tests/fixtures/queries';

function setDefaultQuery(context, defaultQuery) {
  let settings = context.owner.lookup('settings:mocked');
  settings.set('defaultQuery', defaultQuery);
}

module('Acceptance | query filtering', function(hooks) {
  setupForAcceptanceTest(hooks, [RESULTS.MULTIPLE], COLUMNS.ALL);
  // Inject nothing first for defaultQuery. Each test changes it
  setupForMockSettings(hooks, '');

  test('it can create all the various types of fields', async function(assert) {
    setDefaultQuery(this, QUERIES.ALL_SIMPLE);
    assert.expect(1);
    await visit('/queries/new');
    assert.equal(currentRouteName(), 'query');
  });

  test('it can create a filter with all the operators', async function(assert) {
    setDefaultQuery(this, QUERIES.ALL_OPERATORS);
    assert.expect(63);
    await visit('/queries/new');
    assert.equal(currentRouteName(), 'query');

    assert.dom('.filter-container .builder .rules-list .rule-container').exists({ count: 20 });
    let rules = findAll('.filter-container .builder .rules-list .rule-container');

    assert.dom(findIn('.rule-filter-container select', rules[0])).hasValue('string');
    assert.dom(findIn('.rule-operator-container select', rules[0])).hasValue('is_empty');

    assert.dom(findIn('.rule-filter-container select', rules[1])).hasValue('boolean_map_map.boolean_map_map_sub_field_1.boolean_map_map_sub_sub_field_2');
    assert.dom(findIn('.rule-operator-container select', rules[1])).hasValue('equal');
    assert.ok(findIn('.rule-value-container input[value="true"]', rules[1]).checked);

    assert.dom(findIn('.rule-filter-container select', rules[2])).hasValue('string_map_map.string_map_map_sub_field_1.*');
    assert.dom(findIn('.rule-subfield-container input', rules[2])).hasValue('q');
    assert.dom(findIn('.rule-operator-container select', rules[2])).hasValue('not_in');
    assert.dom(findIn('.rule-value-container input', rules[2])).hasValue('gar,age');

    assert.dom(findIn('.rule-filter-container select', rules[3])).hasValue('long');
    assert.dom(findIn('.rule-operator-container select', rules[3])).hasValue('is_null');

    assert.dom(findIn('.rule-filter-container select', rules[4])).hasValue('long_map.long_map_sub_field_1');
    assert.dom(findIn('.rule-operator-container select', rules[4])).hasValue('in');
    assert.dom(findIn('.rule-value-container input', rules[4])).hasValue('5,6,3');

    assert.dom(findIn('.rule-filter-container select', rules[5])).hasValue('boolean_list');
    assert.dom(findIn('.rule-operator-container select', rules[5])).hasValue('size_is');
    assert.dom(findIn('.rule-value-container input', rules[5])).hasValue('12');

    assert.dom(findIn('.rule-filter-container select', rules[6])).hasValue('float_map_map.float_map_map_sub_field_2.float_map_map_sub_sub_field_2');
    assert.dom(findIn('.rule-operator-container select', rules[6])).hasValue('in');
    assert.dom(findIn('.rule-value-container input', rules[6])).hasValue('23.1,42,124.23');

    assert.dom(findIn('.rule-filter-container select', rules[7])).hasValue('string');
    assert.dom(findIn('.rule-operator-container select', rules[7])).hasValue('is_not_empty');

    assert.dom(findIn('.rule-filter-container select', rules[8])).hasValue('integer_map.*');
    assert.dom(findIn('.rule-subfield-container input', rules[8])).hasValue('s');
    assert.dom(findIn('.rule-operator-container select', rules[8])).hasValue('in');
    assert.dom(findIn('.rule-value-container input', rules[8])).hasValue('4,2');

    assert.dom(findIn('.rule-filter-container select', rules[9])).hasValue('string_map_list');
    assert.dom(findIn('.rule-operator-container select', rules[9])).hasValue('is_not_null');

    assert.dom(findIn('.rule-filter-container select', rules[10])).hasValue('boolean');
    assert.dom(findIn('.rule-operator-container select', rules[10])).hasValue('equal');
    assert.ok(findIn('.rule-value-container input[value="true"]', rules[10]).checked);

    assert.dom(findIn('.rule-filter-container select', rules[11])).hasValue('double_map_list');
    assert.dom(findIn('.rule-operator-container select', rules[11])).hasValue('contains_key');
    assert.dom(findIn('.rule-value-container input', rules[11])).hasValue('xzi');

    assert.dom(findIn('.rule-filter-container select', rules[12])).hasValue('boolean_map.*');
    assert.dom(findIn('.rule-subfield-container input', rules[12])).hasValue('b');
    assert.dom(findIn('.rule-operator-container select', rules[12])).hasValue('not_equal');
    assert.ok(findIn('.rule-value-container input[value="false"]', rules[12]).checked);

    assert.dom(findIn('.rule-filter-container select', rules[13])).hasValue('float_list');
    assert.dom(findIn('.rule-operator-container select', rules[13])).hasValue('contains_value');
    assert.dom(findIn('.rule-value-container input', rules[13])).hasValue('42.1');

    assert.dom(findIn('.rule-filter-container select', rules[14])).hasValue('integer');
    assert.dom(findIn('.rule-operator-container select', rules[14])).hasValue('greater');
    assert.dom(findIn('.rule-value-container input', rules[14])).hasValue('0');

    assert.dom(findIn('.rule-filter-container select', rules[15])).hasValue('float');
    assert.dom(findIn('.rule-operator-container select', rules[15])).hasValue('less');
    assert.dom(findIn('.rule-value-container input', rules[15])).hasValue('9');

    assert.dom(findIn('.rule-filter-container select', rules[16])).hasValue('long_map.*');
    assert.dom(findIn('.rule-subfield-container input', rules[16])).hasValue('q');
    assert.dom(findIn('.rule-operator-container select', rules[16])).hasValue('greater_or_equal');
    assert.dom(findIn('.rule-value-container input', rules[16])).hasValue('42');

    assert.dom(findIn('.rule-filter-container select', rules[17])).hasValue('double_map.double_map_sub_field_2');
    assert.dom(findIn('.rule-operator-container select', rules[17])).hasValue('less_or_equal');
    assert.dom(findIn('.rule-value-container input', rules[17])).hasValue('-1');

    assert.dom(findIn('.rule-filter-container select', rules[18])).hasValue('string_map_map.string_map_map_sub_field_1.*');
    assert.dom(findIn('.rule-subfield-container input', rules[18])).hasValue('ext');
    assert.dom(findIn('.rule-operator-container select', rules[18])).hasValue('rlike');
    assert.dom(findIn('.rule-value-container input', rules[18])).hasValue('x42.+,.*foo.*');

    assert.dom(findIn('.rule-filter-container select', rules[19])).hasValue('string_map_map');
    assert.dom(findIn('.rule-operator-container select', rules[19])).hasValue('contains_value');
    assert.dom(findIn('.rule-value-container input', rules[19])).hasValue('zxi');
  });

  test('it can summarize a filter with all operators', async function(assert) {
    setDefaultQuery(this, QUERIES.ALL_OPERATORS);
    assert.expect(4);
    await visit('/queries/new');
    assert.equal(currentRouteName(), 'query');
    await click('.save-button');
    await visit('queries');

    // Need to not use dom() since it trims whitespace
    let summary = find('.query-description .filter-summary-text');
    let { expected } = QUERIES.ALL_OPERATORS.match(/.*WHERE (?<expected>.+?) LIMIT 10/i).groups;
    assert.equal(summary.textContent.trim(), `Filters:  ${expected}`);

    await click('.query-description');
    assert.equal(currentRouteName(), 'query');

    let rules = findAll('.filter-container .builder .rules-list .rule-container');

    await fillIn(findIn('.rule-value-container input', rules[2]), 'garage');
    await fillIn(findIn('.rule-value-container input', rules[6]), '23.1,42,124.23');
    await fillIn(findIn('.rule-value-container input', rules[8]), '8,2');
    await fillIn(findIn('.rule-value-container input', rules[13]), '42.001');
    await fillIn(findIn('.rule-value-container input', rules[17]), '-1.2');
    await fillIn(findIn('.rule-value-container input', rules[18]), '.+42.+,.*\\S');
    await fillIn(findIn('.rule-value-container input', rules[19]), 'xyz');

    await click('.save-button');
    await visit('queries');
    expected =
      'string = \'\' AND boolean_map_map.boolean_map_map_sub_field_1.boolean_map_map_sub_sub_field_2 = true ' +
      'AND ( string_map_map.string_map_map_sub_field_1.q NOT IN [\'garage\'] OR long IS NULL OR ' +
      'long_map.long_map_sub_field_1 IN [5,6,3] OR SIZEIS(boolean_list, 12) OR ' +
      '( float_map_map.float_map_map_sub_field_2.float_map_map_sub_sub_field_2 IN [23.1,42,124.23] AND string != \'\' ' +
      'AND integer_map.s IN [8,2] ) ) AND ( string_map_list IS NOT NULL OR boolean = true OR ' +
      'CONTAINSKEY(double_map_list, \'xzi\') OR boolean_map.b != false OR CONTAINSVALUE(float_list, 42.001) ) AND ' +
      '( integer > 0 OR float < 9 OR long_map.q >= 42 OR double_map.double_map_sub_field_2 <= -1.2 ) AND ' +
      'string_map_map.string_map_map_sub_field_1.ext RLIKE ANY [\'.+42.+\',\'.*\\\\S\'] AND ' +
      'CONTAINSVALUE(string_map_map, \'xyz\')';
    assert.dom('.query-description .filter-summary-text').hasText(`Filters:  ${expected}`);
  });

  test('it suppresses validation for numbers for the operators that allow commas in values', async function(assert) {
    setDefaultQuery(this, QUERIES.ALL_MULTIPLE_OPERATORS);
    assert.expect(34);
    await visit('/queries/new');
    assert.equal(currentRouteName(), 'query');

    assert.dom('.filter-container .builder .rules-list .rule-container').exists({ count: 5 });
    let rules = findAll('.filter-container .builder .rules-list .rule-container');

    // String
    await fillIn(findIn('.rule-value-container input', rules[0]), '');
    await click('.save-button');
    assert.dom(rules[0]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[0])).hasAttribute('data-original-title', 'Empty value');
    await fillIn(findIn('.rule-value-container input', rules[0]), 'qux,bar,baz');
    await click('.save-button');
    assert.dom(rules[0]).doesNotHaveClass('has-error');

    // Float
    await fillIn(findIn('.rule-value-container input', rules[1]), '');
    await click('.save-button');
    assert.dom(rules[1]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[1])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[1]), 'fooooo');
    await click('.save-button');
    assert.dom(rules[1]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[1])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[1]), 'fooooo,1.3');
    await click('.save-button');
    assert.dom(rules[1]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[1])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[1]), '1,2,3,4,5,6.1');
    await click('.save-button');
    assert.dom(rules[1]).doesNotHaveClass('has-error');

    // Integer
    await fillIn(findIn('.rule-value-container input', rules[2]), '');
    await click('.save-button');
    assert.dom(rules[2]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[2])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[2]), 'fooooo');
    await click('.save-button');
    assert.dom(rules[2]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[2])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[2]), 'fooooo,1');
    await click('.save-button');
    assert.dom(rules[2]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[2])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[2]), '1,42');
    await click('.save-button');
    assert.dom(rules[2]).doesNotHaveClass('has-error');

    // Double
    await fillIn(findIn('.rule-value-container input', rules[3]), '');
    await click('.save-button');
    assert.dom(rules[3]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[3])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[3]), 'fooooo');
    await click('.save-button');
    assert.dom(rules[3]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[3])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[3]), 'fooooo,42.424');
    await click('.save-button');
    assert.dom(rules[3]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[3])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[3]), '1.2,42');
    await click('.save-button');
    assert.dom(rules[3]).doesNotHaveClass('has-error');

    // Long
    await fillIn(findIn('.rule-value-container input', rules[4]), '');
    await click('.save-button');
    assert.dom(rules[4]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[4])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[4]), 'fooooo');
    await click('.save-button');
    assert.dom(rules[4]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[4])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[4]), 'fooooo,1');
    await click('.save-button');
    assert.dom(rules[4]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[4])).hasAttribute('data-original-title', 'Not a number');
    await fillIn(findIn('.rule-value-container input', rules[4]), '42');
    await click('.save-button');
    assert.dom(rules[4]).doesNotHaveClass('has-error');

    await visit('queries');
    let expected =
      'string IN [\'qux\',\'bar\',\'baz\'] AND float IN [1,2,3,4,5,6.1] AND integer IN [1,42] ' +
      'AND double NOT IN [1.2,42] AND long_map.l IN [42]';
    assert.dom('.query-description .filter-summary-text').hasText(`Filters:  ${expected}`);
  });

  test('it can validate values for the size is operator', async function(assert) {
    setDefaultQuery(this, QUERIES.ALL_SIZEIS);
    assert.expect(11);
    await visit('/queries/new');
    assert.equal(currentRouteName(), 'query');

    assert.dom('.filter-container .builder .rules-list .rule-container').exists({ count: 1 });
    let rule = find('.filter-container .builder .rules-list .rule-container');

    await fillIn(findIn('.rule-value-container input', rule), '');
    await click('.save-button');
    assert.dom(rule).hasClass('has-error');
    assert.dom(findIn('.error-container', rule)).hasAttribute('data-original-title', 'Empty value');

    await fillIn(findIn('.rule-value-container input', rule), 'foo');
    await click('.save-button');
    assert.dom(rule).hasClass('has-error');
    assert.dom(findIn('.error-container', rule)).hasAttribute('data-original-title', 'Not an integer');

    await fillIn(findIn('.rule-value-container input', rule), '42.1');
    await click('.save-button');
    assert.dom(rule).hasClass('has-error');
    assert.dom(findIn('.error-container', rule)).hasAttribute('data-original-title', 'Not an integer');

    await fillIn(findIn('.rule-value-container input', rule), '-4');
    await click('.save-button');
    assert.dom(rule).hasClass('has-error');
    assert.dom(findIn('.error-container', rule)).hasAttribute('data-original-title', 'Must be greater than -1');

    await fillIn(findIn('.rule-value-container input', rule), '42');
    await click('.save-button');
    assert.dom(rule).doesNotHaveClass('has-error');
  });

  test('it can validate on base types for contains value', async function(assert) {
    setDefaultQuery(this, QUERIES.ALL_CONTAINSVALUE);
    assert.expect(35);
    await visit('/queries/new');
    assert.equal(currentRouteName(), 'query');

    assert.dom('.filter-container .builder .rules-list .rule-container').exists({ count: 7 });
    let rules = findAll('.filter-container .builder .rules-list .rule-container');

    // Boolean
    await fillIn(findIn('.rule-value-container input', rules[0]), 'True');
    await click('.save-button');
    assert.dom(rules[0]).doesNotHaveClass('has-error');
    await fillIn(findIn('.rule-value-container input', rules[0]), 'T');
    await click('.save-button');
    assert.dom(rules[0]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[0])).hasAttribute('data-original-title', 'Not a boolean');
    await fillIn(findIn('.rule-value-container input', rules[0]), 'F');
    await click('.save-button');
    assert.dom(rules[0]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[0])).hasAttribute('data-original-title', 'Not a boolean');
    await fillIn(findIn('.rule-value-container input', rules[0]), 'FALSE');
    await click('.save-button');
    assert.dom(rules[0]).doesNotHaveClass('has-error');

    // Integer
    await fillIn(findIn('.rule-value-container input', rules[1]), '42');
    await click('.save-button');
    assert.dom(rules[1]).doesNotHaveClass('has-error');
    await fillIn(findIn('.rule-value-container input', rules[1]), '42.1');
    await click('.save-button');
    assert.dom(rules[1]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[1])).hasAttribute('data-original-title', 'Not an integer');
    await fillIn(findIn('.rule-value-container input', rules[1]), 'foo.1');
    await click('.save-button');
    assert.dom(rules[1]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[1])).hasAttribute('data-original-title', 'Not an integer');
    await fillIn(findIn('.rule-value-container input', rules[1]), '0');
    await click('.save-button');
    assert.dom(rules[1]).doesNotHaveClass('has-error');

    // Long
    await fillIn(findIn('.rule-value-container input', rules[2]), '2');
    await click('.save-button');
    assert.dom(rules[2]).doesNotHaveClass('has-error');
    await fillIn(findIn('.rule-value-container input', rules[2]), '42.1');
    await click('.save-button');
    assert.dom(rules[2]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[2])).hasAttribute('data-original-title', 'Not an integer');
    await fillIn(findIn('.rule-value-container input', rules[2]), 'foo.1');
    await click('.save-button');
    assert.dom(rules[2]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[2])).hasAttribute('data-original-title', 'Not an integer');
    await fillIn(findIn('.rule-value-container input', rules[2]), '01');
    await click('.save-button');
    assert.dom(rules[2]).doesNotHaveClass('has-error');

    // Double
    await fillIn(findIn('.rule-value-container input', rules[3]), '2.1');
    await click('.save-button');
    assert.dom(rules[3]).doesNotHaveClass('has-error');
    await fillIn(findIn('.rule-value-container input', rules[3]), '1e-5');
    await click('.save-button');
    assert.dom(rules[3]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[3])).hasAttribute('data-original-title', 'Not a real number');
    await fillIn(findIn('.rule-value-container input', rules[3]), 'foo.1');
    await click('.save-button');
    assert.dom(rules[3]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[3])).hasAttribute('data-original-title', 'Not a real number');
    await fillIn(findIn('.rule-value-container input', rules[3]), '-1.52');
    await click('.save-button');
    assert.dom(rules[3]).doesNotHaveClass('has-error');

    // Float
    await fillIn(findIn('.rule-value-container input', rules[4]), '2.1');
    await click('.save-button');
    assert.dom(rules[4]).doesNotHaveClass('has-error');
    await fillIn(findIn('.rule-value-container input', rules[4]), '1e-5');
    await click('.save-button');
    assert.dom(rules[4]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[4])).hasAttribute('data-original-title', 'Not a real number');
    await fillIn(findIn('.rule-value-container input', rules[4]), 'foo.1');
    await click('.save-button');
    assert.dom(rules[4]).hasClass('has-error');
    assert.dom(findIn('.error-container', rules[4])).hasAttribute('data-original-title', 'Not a real number');
    await fillIn(findIn('.rule-value-container input', rules[4]), '42.52000001');
    await click('.save-button');
    assert.dom(rules[4]).doesNotHaveClass('has-error');

    // String
    await fillIn(findIn('.rule-value-container input', rules[5]), '2.1');
    await click('.save-button');
    assert.dom(rules[5]).doesNotHaveClass('has-error');
    await fillIn(findIn('.rule-value-container input', rules[5]), 'foo.1');
    await click('.save-button');
    assert.dom(rules[5]).doesNotHaveClass('has-error');

    await visit('queries');
    let expected =
      'CONTAINSVALUE(boolean_list, FALSE) AND CONTAINSVALUE(integer_map, 0) AND ' +
      'CONTAINSVALUE(long_map_map, 01) AND CONTAINSVALUE(double_map_list, -1.52) AND ' +
      'CONTAINSVALUE(float_map_map, 42.52000001) AND CONTAINSVALUE(string_list, \'foo.1\') AND ' +
      'CONTAINSVALUE(string_map_list, \'xyz\')';
    assert.dom('.query-description .filter-summary-text').hasText(`Filters:  ${expected}`);
  });
});

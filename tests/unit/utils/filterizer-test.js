/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Filterizer from 'bullet-ui/utils/filterizer';
import { module, test } from 'qunit';

const [SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR] = [ '.*', '.', ','];

module('Unit | Utility | filterizer', function() {
  test('it recognizes nulls', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    assert.ok(subject.isNull('null'));
    assert.ok(subject.isNull('Null'));
    assert.ok(subject.isNull('NULL'));
    assert.notOk(subject.isNull('foo'));
  });

  test('it recognizes the logical operations', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    assert.ok(subject.isLogical('AND'));
    assert.ok(subject.isLogical('OR'));
    assert.ok(subject.isLogical('NOT'));
    assert.notOk(subject.isLogical('foo'));
    assert.notOk(subject.isLogical('or'));
  });

  test('it wraps a simple API clause into an AND builder rule', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let clause = { field: 'foo', operation: '<', values: [5] };
    let expected = { condition: 'AND', rules: [{ id: 'foo', field: 'foo', operator: 'less', value: '5' }] };
    assert.deepEqual(subject.convertClauseToRule(clause), expected);
  });

  test('it accepts empty clauses', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let clause = { operation: 'AND', clauses: [] };
    let expected = { condition: 'AND', rules: [] };
    assert.deepEqual(subject.convertClauseToRule(clause), expected);
  });

  test('it does not accept empty fields for API clauses', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let clause = { operation: '<', values: [1] };
    assert.throws(() => {
      subject.convertClauseToRule(clause);
    }, 'No field found');
    clause = { field: null, operation: '<', values: [1, 2] };
    assert.throws(() => {
      subject.convertClauseToRule(clause);
    }, 'No field found');
  });

  test('it does not accept empty values for API clauses', function(assert) {

    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let clause = { field: 'foo', operation: '<' };
    assert.throws(() => {
      subject.convertClauseToRule(clause);
    }, 'No values found');
    clause = { field: 'foo', operation: '<', values: [] };
    assert.throws(() => {
      subject.convertClauseToRule(clause);
    }, 'No values found');
  });

  test('it does not allow unknown operations for API clauses', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let clause = { field: 'foo', values: [5] };
    assert.throws(() => {
      subject.convertClauseToRule(clause);
    }, 'Unknown operation');
    clause = { field: 'foo', operation: 'contains', values: [] };
    assert.throws(() => {
      subject.convertClauseToRule(clause);
    }, 'Unknown operation');
  });

  test('it accepts empty rules', function(assert) {

    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let rule = { condition: 'AND', rules: [] };
    let expected = { operation: 'AND', clauses: [] };
    assert.deepEqual(subject.convertRuleToClause(rule), expected);
  });

  test('it does not allow unknown operators in builder rules', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let rule = { condition: 'OR', rules: [{ id: 'foo', value: 'bar' }] };
    assert.throws(() => {
      subject.convertRuleToClause(rule);
    }, 'Unknown operator');
    rule = { condition: 'OR', rules: [{ id: 'foo', operator: 'contains', value: 'bar' }] };
    assert.throws(() => {
      subject.convertRuleToClause(rule);
    }, 'Unknown operator');
  });

  const CANONICAL_CLAUSE = {
    operation: 'AND',
    clauses: [
      {
        operation: 'OR',
        clauses: [
          { field: 'second_level_0', operation: '==', values: ['null'] },
          { field: 'second_level_0', operation: '==', values: [''] },
          { field: 'second_level_0', operation: '==', values: ['foo'] },
          { field: 'second_level_0', operation: '==', values: ['foo', 'bar'] },
          { field: 'second_level_1', operation: '!=', values: ['Null'] },
          { field: 'second_level_1', operation: '!=', values: [''] },
          { field: 'second_level_1', operation: '!=', values: ['foo'] },
          { field: 'second_level_1', operation: '!=', values: ['foo', 'bar'] },
          { field: 'second_level_2.foo', operation: '==', values: ['foo', 'bar'] },
          { field: 'second_level_3', operation: '>', values: ['1'] },
          { field: 'second_level_4', operation: '<', values: ['-1'] },
          { field: 'second_level_5', operation: '>=', values: ['2'] },
          { field: 'second_level_6', operation: '<=', values: ['-2'] },
          { field: 'second_level_7.bar', operation: 'RLIKE', values: ['f.*'] },
          { field: 'second_level_8', operation: 'RLIKE', values: ['null'] }
        ]
      },
      { field: 'top_level', operation: 'RLIKE', values: ['2.*', '.*3.*'] }
    ]
  };

  const CONVERTED_RULE = {
    condition: 'AND',
    rules: [
      {
        condition: 'OR',
        rules: [
          { field: 'second_level_0', id: 'second_level_0', operator: 'is_null' },
          { field: 'second_level_0', id: 'second_level_0', operator: 'is_empty' },
          { field: 'second_level_0', id: 'second_level_0', value: 'foo', operator: 'equal' },
          { field: 'second_level_0', id: 'second_level_0', value: 'foo,bar', operator: 'in' },
          { field: 'second_level_1', id: 'second_level_1', operator: 'is_not_null' },
          { field: 'second_level_1', id: 'second_level_1', operator: 'is_not_empty' },
          { field: 'second_level_1', id: 'second_level_1', value: 'foo', operator: 'not_equal' },
          { field: 'second_level_1', id: 'second_level_1', value: 'foo,bar', operator: 'not_in' },
          { field: 'second_level_2.foo', id: 'second_level_2.foo', value: 'foo,bar', operator: 'in' },
          { field: 'second_level_3', id: 'second_level_3', value: '1', operator: 'greater' },
          { field: 'second_level_4', id: 'second_level_4', value: '-1', operator: 'less' },
          { field: 'second_level_5', id: 'second_level_5', value: '2', operator: 'greater_or_equal' },
          { field: 'second_level_6', id: 'second_level_6', value: '-2', operator: 'less_or_equal' },
          { field: 'second_level_7.bar', id: 'second_level_7.bar', value: 'f.*', operator: 'rlike' },
          { field: 'second_level_8', id: 'second_level_8', value: 'null', operator: 'rlike' }
        ]
      },
      { field: 'top_level', id: 'top_level', value: '2.*,.*3.*', operator: 'rlike' }
    ]
  };

  const CANONICAL_RULE = {
    condition: 'AND',
    rules: [
      {
        condition: 'OR',
        rules: [
          { field: 'second_level_0', operator: 'is_null' },
          { field: 'second_level_0', operator: 'is_empty' },
          { field: 'second_level_0', value: 'foo', operator: 'equal' },
          { field: 'second_level_0', value: 'foo,bar', operator: 'in' },
          { field: 'second_level_1', operator: 'is_not_null' },
          { field: 'second_level_1', operator: 'is_not_empty' },
          { field: 'second_level_1', value: 'foo', operator: 'not_equal' },
          { field: 'second_level_1', value: 'foo,bar', operator: 'not_in' },
          { field: 'second_level_2.foo', value: 'foo,bar', operator: 'in' },
          { field: 'second_level_3', value: '1', operator: 'greater' },
          { field: 'second_level_4', value: '-1', operator: 'less' },
          { field: 'second_level_5', value: '2', operator: 'greater_or_equal' },
          { field: 'second_level_6', value: '-2', operator: 'less_or_equal' },
          { field: 'second_level_7.*', value: 'f.*', subfield: 'bar', operator: 'rlike' },
          { field: 'second_level_8', value: 'null', operator: 'rlike' }
        ]
      },
      { field: 'top_level', value: '2.*,.*3.*', operator: 'rlike' }
    ]
  };

  const CONVERTED_CLAUSE = {
    operation: 'AND',
    clauses: [
      {
        operation: 'OR',
        clauses: [
          { field: 'second_level_0', operation: '==', values: ['NULL'] },
          { field: 'second_level_0', operation: '==', values: [''] },
          { field: 'second_level_0', operation: '==', values: ['foo'] },
          { field: 'second_level_0', operation: '==', values: ['foo', 'bar'] },
          { field: 'second_level_1', operation: '!=', values: ['NULL'] },
          { field: 'second_level_1', operation: '!=', values: [''] },
          { field: 'second_level_1', operation: '!=', values: ['foo'] },
          { field: 'second_level_1', operation: '!=', values: ['foo', 'bar'] },
          { field: 'second_level_2.foo', operation: '==', values: ['foo', 'bar'] },
          { field: 'second_level_3', operation: '>', values: ['1'] },
          { field: 'second_level_4', operation: '<', values: ['-1'] },
          { field: 'second_level_5', operation: '>=', values: ['2'] },
          { field: 'second_level_6', operation: '<=', values: ['-2'] },
          { field: 'second_level_7.bar', operation: 'RLIKE', values: ['f.*'] },
          { field: 'second_level_8', operation: 'RLIKE', values: ['null'] }
        ]
      },
      { field: 'top_level', operation: 'RLIKE', values: ['2.*', '.*3.*'] }
    ]
  };

  test('it can convert from an API filter specification to the builder specification', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let convertedRule = subject.convertClauseToRule(CANONICAL_CLAUSE);
    assert.deepEqual(convertedRule, CONVERTED_RULE);
  });

  test('it can convert from a builder specification to the API filter specification', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, true);
    let convertedClause = subject.convertRuleToClause(CANONICAL_RULE);
    assert.deepEqual(convertedClause, CONVERTED_CLAUSE);
  });

  const CONVERTED_RULE_FROM_API_MODE = {
    condition: 'AND',
    rules: [
      {
        condition: 'OR',
        rules: [
          { field: 'second_level_0', id: 'second_level_0', operator: 'is_null' },
          { field: 'second_level_0', id: 'second_level_0', operator: 'is_empty' },
          { field: 'second_level_0', id: 'second_level_0', value: 'foo', operator: 'equal' },
          { field: 'second_level_0', id: 'second_level_0', value: 'foo,bar', operator: 'in' },
          { field: 'second_level_1', id: 'second_level_1', operator: 'is_not_null' },
          { field: 'second_level_1', id: 'second_level_1', operator: 'is_not_empty' },
          { field: 'second_level_1', id: 'second_level_1', value: 'foo', operator: 'not_equal' },
          { field: 'second_level_1', id: 'second_level_1', value: 'foo,bar', operator: 'not_in' },
          { field: 'second_level_2.foo', id: 'second_level_2.foo', value: 'foo,bar', operator: 'in' },
          { field: 'second_level_3', id: 'second_level_3', value: '1', operator: 'greater' },
          { field: 'second_level_4', id: 'second_level_4', value: '-1', operator: 'less' },
          { field: 'second_level_5', id: 'second_level_5', value: '2', operator: 'greater_or_equal' },
          { field: 'second_level_6', id: 'second_level_6', value: '-2', operator: 'less_or_equal' },
          { field: 'second_level_7.*', id: 'second_level_7.*', value: 'f.*', subfield: 'bar', operator: 'rlike' },
          { field: 'second_level_8', id: 'second_level_8', value: 'null', operator: 'rlike' }
        ]
      },
      { field: 'top_level', id: 'top_level', value: '2.*,.*3.*', operator: 'rlike' }
    ]
  };

  const CONVERTED_CLAUSE_NOT_IN_API_MODE = {
    operation: 'AND',
    clauses: [
      {
        operation: 'OR',
        clauses: [
          { field: 'second_level_0', operation: '==', values: ['NULL'] },
          { field: 'second_level_0', operation: '==', values: [''] },
          { field: 'second_level_0', operation: '==', values: ['foo'] },
          { field: 'second_level_0', operation: '==', values: ['foo', 'bar'] },
          { field: 'second_level_1', operation: '!=', values: ['NULL'] },
          { field: 'second_level_1', operation: '!=', values: [''] },
          { field: 'second_level_1', operation: '!=', values: ['foo'] },
          { field: 'second_level_1', operation: '!=', values: ['foo', 'bar'] },
          { field: 'second_level_2.foo', operation: '==', values: ['foo', 'bar'] },
          { field: 'second_level_3', operation: '>', values: ['1'] },
          { field: 'second_level_4', operation: '<', values: ['-1'] },
          { field: 'second_level_5', operation: '>=', values: ['2'] },
          { field: 'second_level_6', operation: '<=', values: ['-2'] },
          { field: 'second_level_7.bar', subfield: true, operation: 'RLIKE', values: ['f.*'] },
          { field: 'second_level_8', operation: 'RLIKE', values: ['null'] }
        ]
      },
      { field: 'top_level', operation: 'RLIKE', values: ['2.*', '.*3.*'] }
    ]
  };

  test('it can convert from a builder specification to the API filter specification with subfield metadata', function(assert) {
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, false);
    let convertedClause = subject.convertRuleToClause(CANONICAL_RULE);
    assert.deepEqual(convertedClause, CONVERTED_CLAUSE_NOT_IN_API_MODE);
  });

  test('it can convert from an API filter with metadata specification to the builder specification', function(assert) {
    // Does not matter if we're in apiMode or not
    let subject = new Filterizer(SUBFIELD_SUFFIX, SUBFIELD_SEPARATOR, MULTIPLE_VALUE_SEPARATOR, false);
    let convertedRule = subject.convertClauseToRule(CONVERTED_CLAUSE_NOT_IN_API_MODE);
    assert.deepEqual(convertedRule, CONVERTED_RULE_FROM_API_MODE);
  });
});

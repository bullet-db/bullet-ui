/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import {
  Enum, MAP_ACCESSOR, LIST_ACCESSOR_START, LIST_ACCESSOR_END, TYPES, TYPE_CLASSES, getSubType, getTypeClass,
  getTypeDescription, getBasePrimitive, wrapMapKey, wrapListIndex, extractMapKey, extractListIndex
} from 'bullet-ui/utils/type';

module('Unit | Utility | type', function() {
  test('it allows you enumerate values', function(assert) {
    const enumerated = Enum.of(['RED', 'GREEN', 'BLUE']);
    let symbols = enumerated.symbols;
    let names = enumerated.names;

    assert.equal(symbols.length, 3);
    assert.equal(names.length, 3);
    for (let i = 0; i < 3; ++i) {
      assert.ok(enumerated.hasSymbol(symbols[i]));
      assert.ok(enumerated.hasName(names[i]));
      assert.ok(enumerated.forName(names[i]) === symbols[i]);
      assert.ok(Enum.forSymbol(symbols[i]) === names[i]);
    }
    assert.notOk(enumerated.hasSymbol(Symbol.for('YELLOW')));
    assert.notOk(enumerated.hasName('YELLOW'));
  });

  test('it defines the types supported', function(assert) {
    assert.ok(TYPES.names.length, 30);

    assert.ok(TYPES.hasName('INTEGER'));
    assert.ok(TYPES.hasName('LONG'));
    assert.ok(TYPES.hasName('FLOAT'));
    assert.ok(TYPES.hasName('DOUBLE'));
    assert.ok(TYPES.hasName('STRING'));
    assert.ok(TYPES.hasName('BOOLEAN'));
    assert.ok(TYPES.hasName('INTEGER_MAP'));
    assert.ok(TYPES.hasName('LONG_MAP'));
    assert.ok(TYPES.hasName('FLOAT_MAP'));
    assert.ok(TYPES.hasName('DOUBLE_MAP'));
    assert.ok(TYPES.hasName('STRING_MAP'));
    assert.ok(TYPES.hasName('BOOLEAN_MAP'));
    assert.ok(TYPES.hasName('INTEGER_MAP_MAP'));
    assert.ok(TYPES.hasName('LONG_MAP_MAP'));
    assert.ok(TYPES.hasName('FLOAT_MAP_MAP'));
    assert.ok(TYPES.hasName('DOUBLE_MAP_MAP'));
    assert.ok(TYPES.hasName('STRING_MAP_MAP'));
    assert.ok(TYPES.hasName('BOOLEAN_MAP_MAP'));
    assert.ok(TYPES.hasName('INTEGER_LIST'));
    assert.ok(TYPES.hasName('LONG_LIST'));
    assert.ok(TYPES.hasName('FLOAT_LIST'));
    assert.ok(TYPES.hasName('DOUBLE_LIST'));
    assert.ok(TYPES.hasName('STRING_LIST'));
    assert.ok(TYPES.hasName('BOOLEAN_LIST'));
    assert.ok(TYPES.hasName('INTEGER_MAP_LIST'));
    assert.ok(TYPES.hasName('LONG_MAP_LIST'));
    assert.ok(TYPES.hasName('FLOAT_MAP_LIST'));
    assert.ok(TYPES.hasName('DOUBLE_MAP_LIST'));
    assert.ok(TYPES.hasName('STRING_MAP_LIST'));
    assert.ok(TYPES.hasName('BOOLEAN_MAP_LIST'));
  });

  test('it defines the type classes supported', function(assert) {
    assert.ok(TYPE_CLASSES.names.length, 5);

    assert.ok(TYPE_CLASSES.hasName('PRIMITIVE'));
    assert.ok(TYPE_CLASSES.hasName('PRIMITIVE_MAP'));
    assert.ok(TYPE_CLASSES.hasName('PRIMITIVE_LIST'));
    assert.ok(TYPE_CLASSES.hasName('PRIMITIVE_MAP_MAP'));
    assert.ok(TYPE_CLASSES.hasName('PRIMITIVE_MAP_LIST'));
  });

  test('it can find the base type of any type', function(assert) {
    assert.equal(getBasePrimitive('INTEGER'), 'INTEGER');
    assert.equal(getBasePrimitive('LONG'), 'LONG');
    assert.equal(getBasePrimitive('FLOAT'), 'FLOAT');
    assert.equal(getBasePrimitive('DOUBLE'), 'DOUBLE');
    assert.equal(getBasePrimitive('STRING'), 'STRING');
    assert.equal(getBasePrimitive('BOOLEAN'), 'BOOLEAN');
    assert.equal(getBasePrimitive('INTEGER_MAP'), 'INTEGER');
    assert.equal(getBasePrimitive('LONG_MAP'), 'LONG');
    assert.equal(getBasePrimitive('FLOAT_MAP'), 'FLOAT');
    assert.equal(getBasePrimitive('DOUBLE_MAP'), 'DOUBLE');
    assert.equal(getBasePrimitive('STRING_MAP'), 'STRING');
    assert.equal(getBasePrimitive('BOOLEAN_MAP'), 'BOOLEAN');
    assert.equal(getBasePrimitive('INTEGER_MAP_MAP'), 'INTEGER');
    assert.equal(getBasePrimitive('LONG_MAP_MAP'), 'LONG');
    assert.equal(getBasePrimitive('FLOAT_MAP_MAP'), 'FLOAT');
    assert.equal(getBasePrimitive('DOUBLE_MAP_MAP'), 'DOUBLE');
    assert.equal(getBasePrimitive('STRING_MAP_MAP'), 'STRING');
    assert.equal(getBasePrimitive('BOOLEAN_MAP_MAP'), 'BOOLEAN');
    assert.equal(getBasePrimitive('INTEGER_LIST'), 'INTEGER');
    assert.equal(getBasePrimitive('LONG_LIST'), 'LONG');
    assert.equal(getBasePrimitive('FLOAT_LIST'), 'FLOAT');
    assert.equal(getBasePrimitive('DOUBLE_LIST'), 'DOUBLE');
    assert.equal(getBasePrimitive('STRING_LIST'), 'STRING');
    assert.equal(getBasePrimitive('BOOLEAN_LIST'), 'BOOLEAN');
    assert.equal(getBasePrimitive('INTEGER_MAP_LIST'), 'INTEGER');
    assert.equal(getBasePrimitive('LONG_MAP_LIST'), 'LONG');
    assert.equal(getBasePrimitive('FLOAT_MAP_LIST'), 'FLOAT');
    assert.equal(getBasePrimitive('DOUBLE_MAP_LIST'), 'DOUBLE');
    assert.equal(getBasePrimitive('STRING_MAP_LIST'), 'STRING');
    assert.equal(getBasePrimitive('BOOLEAN_MAP_LIST'), 'BOOLEAN');
  });

  test('it can find the sub type of any type', function(assert) {
    assert.notOk(getSubType('INTEGER'));
    assert.notOk(getSubType('LONG'));
    assert.notOk(getSubType('FLOAT'));
    assert.notOk(getSubType('DOUBLE'));
    assert.notOk(getSubType('STRING'));
    assert.notOk(getSubType('BOOLEAN'));
    assert.equal(getSubType('INTEGER_MAP'), 'INTEGER');
    assert.equal(getSubType('LONG_MAP'), 'LONG');
    assert.equal(getSubType('FLOAT_MAP'), 'FLOAT');
    assert.equal(getSubType('DOUBLE_MAP'), 'DOUBLE');
    assert.equal(getSubType('STRING_MAP'), 'STRING');
    assert.equal(getSubType('BOOLEAN_MAP'), 'BOOLEAN');
    assert.equal(getSubType('INTEGER_MAP_MAP'), 'INTEGER_MAP');
    assert.equal(getSubType('LONG_MAP_MAP'), 'LONG_MAP');
    assert.equal(getSubType('FLOAT_MAP_MAP'), 'FLOAT_MAP');
    assert.equal(getSubType('DOUBLE_MAP_MAP'), 'DOUBLE_MAP');
    assert.equal(getSubType('STRING_MAP_MAP'), 'STRING_MAP');
    assert.equal(getSubType('BOOLEAN_MAP_MAP'), 'BOOLEAN_MAP');
    assert.equal(getSubType('INTEGER_LIST'), 'INTEGER');
    assert.equal(getSubType('LONG_LIST'), 'LONG');
    assert.equal(getSubType('FLOAT_LIST'), 'FLOAT');
    assert.equal(getSubType('DOUBLE_LIST'), 'DOUBLE');
    assert.equal(getSubType('STRING_LIST'), 'STRING');
    assert.equal(getSubType('BOOLEAN_LIST'), 'BOOLEAN');
    assert.equal(getSubType('INTEGER_MAP_LIST'), 'INTEGER_MAP');
    assert.equal(getSubType('LONG_MAP_LIST'), 'LONG_MAP');
    assert.equal(getSubType('FLOAT_MAP_LIST'), 'FLOAT_MAP');
    assert.equal(getSubType('DOUBLE_MAP_LIST'), 'DOUBLE_MAP');
    assert.equal(getSubType('STRING_MAP_LIST'), 'STRING_MAP');
    assert.equal(getSubType('BOOLEAN_MAP_LIST'), 'BOOLEAN_MAP');
  });

  test('it can find the type class of any type', function(assert) {
    assert.equal(getTypeClass('INTEGER'), TYPE_CLASSES.PRIMITIVE);
    assert.equal(getTypeClass('LONG'), TYPE_CLASSES.PRIMITIVE);
    assert.equal(getTypeClass('FLOAT'), TYPE_CLASSES.PRIMITIVE);
    assert.equal(getTypeClass('DOUBLE'), TYPE_CLASSES.PRIMITIVE);
    assert.equal(getTypeClass('STRING'), TYPE_CLASSES.PRIMITIVE);
    assert.equal(getTypeClass('BOOLEAN'), TYPE_CLASSES.PRIMITIVE);
    assert.equal(getTypeClass('INTEGER_MAP'), TYPE_CLASSES.PRIMITIVE_MAP);
    assert.equal(getTypeClass('LONG_MAP'), TYPE_CLASSES.PRIMITIVE_MAP);
    assert.equal(getTypeClass('FLOAT_MAP'), TYPE_CLASSES.PRIMITIVE_MAP);
    assert.equal(getTypeClass('DOUBLE_MAP'), TYPE_CLASSES.PRIMITIVE_MAP);
    assert.equal(getTypeClass('STRING_MAP'), TYPE_CLASSES.PRIMITIVE_MAP);
    assert.equal(getTypeClass('BOOLEAN_MAP'), TYPE_CLASSES.PRIMITIVE_MAP);
    assert.equal(getTypeClass('INTEGER_MAP_MAP'), TYPE_CLASSES.PRIMITIVE_MAP_MAP);
    assert.equal(getTypeClass('LONG_MAP_MAP'), TYPE_CLASSES.PRIMITIVE_MAP_MAP);
    assert.equal(getTypeClass('FLOAT_MAP_MAP'), TYPE_CLASSES.PRIMITIVE_MAP_MAP);
    assert.equal(getTypeClass('DOUBLE_MAP_MAP'), TYPE_CLASSES.PRIMITIVE_MAP_MAP);
    assert.equal(getTypeClass('STRING_MAP_MAP'), TYPE_CLASSES.PRIMITIVE_MAP_MAP);
    assert.equal(getTypeClass('BOOLEAN_MAP_MAP'), TYPE_CLASSES.PRIMITIVE_MAP_MAP);
    assert.equal(getTypeClass('INTEGER_LIST'), TYPE_CLASSES.PRIMITIVE_LIST);
    assert.equal(getTypeClass('LONG_LIST'), TYPE_CLASSES.PRIMITIVE_LIST);
    assert.equal(getTypeClass('FLOAT_LIST'), TYPE_CLASSES.PRIMITIVE_LIST);
    assert.equal(getTypeClass('DOUBLE_LIST'), TYPE_CLASSES.PRIMITIVE_LIST);
    assert.equal(getTypeClass('STRING_LIST'), TYPE_CLASSES.PRIMITIVE_LIST);
    assert.equal(getTypeClass('BOOLEAN_LIST'), TYPE_CLASSES.PRIMITIVE_LIST);
    assert.equal(getTypeClass('INTEGER_MAP_LIST'), TYPE_CLASSES.PRIMITIVE_MAP_LIST);
    assert.equal(getTypeClass('LONG_MAP_LIST'), TYPE_CLASSES.PRIMITIVE_MAP_LIST);
    assert.equal(getTypeClass('FLOAT_MAP_LIST'), TYPE_CLASSES.PRIMITIVE_MAP_LIST);
    assert.equal(getTypeClass('DOUBLE_MAP_LIST'), TYPE_CLASSES.PRIMITIVE_MAP_LIST);
    assert.equal(getTypeClass('STRING_MAP_LIST'), TYPE_CLASSES.PRIMITIVE_MAP_LIST);
    assert.equal(getTypeClass('BOOLEAN_MAP_LIST'), TYPE_CLASSES.PRIMITIVE_MAP_LIST);
  });

  test('it can provide a description for any type given a type class', function(assert) {
    assert.equal(getTypeDescription('INTEGER', TYPE_CLASSES.PRIMITIVE), 'INTEGER');
    assert.equal(getTypeDescription('LONG', TYPE_CLASSES.PRIMITIVE), 'LONG');
    assert.equal(getTypeDescription('FLOAT', TYPE_CLASSES.PRIMITIVE), 'FLOAT');
    assert.equal(getTypeDescription('DOUBLE', TYPE_CLASSES.PRIMITIVE), 'DOUBLE');
    assert.equal(getTypeDescription('STRING', TYPE_CLASSES.PRIMITIVE), 'STRING');
    assert.equal(getTypeDescription('BOOLEAN', TYPE_CLASSES.PRIMITIVE), 'BOOLEAN');
    assert.equal(getTypeDescription('INTEGER_MAP', TYPE_CLASSES.PRIMITIVE_MAP), 'MAP<STRING, INTEGER>');
    assert.equal(getTypeDescription('LONG_MAP', TYPE_CLASSES.PRIMITIVE_MAP), 'MAP<STRING, LONG>');
    assert.equal(getTypeDescription('FLOAT_MAP', TYPE_CLASSES.PRIMITIVE_MAP), 'MAP<STRING, FLOAT>');
    assert.equal(getTypeDescription('DOUBLE_MAP', TYPE_CLASSES.PRIMITIVE_MAP), 'MAP<STRING, DOUBLE>');
    assert.equal(getTypeDescription('STRING_MAP', TYPE_CLASSES.PRIMITIVE_MAP), 'MAP<STRING, STRING>');
    assert.equal(getTypeDescription('BOOLEAN_MAP', TYPE_CLASSES.PRIMITIVE_MAP), 'MAP<STRING, BOOLEAN>');
    assert.equal(getTypeDescription('INTEGER_MAP_MAP', TYPE_CLASSES.PRIMITIVE_MAP_MAP), 'MAP<STRING, MAP<STRING, INTEGER>>');
    assert.equal(getTypeDescription('LONG_MAP_MAP', TYPE_CLASSES.PRIMITIVE_MAP_MAP), 'MAP<STRING, MAP<STRING, LONG>>');
    assert.equal(getTypeDescription('FLOAT_MAP_MAP', TYPE_CLASSES.PRIMITIVE_MAP_MAP), 'MAP<STRING, MAP<STRING, FLOAT>>');
    assert.equal(getTypeDescription('DOUBLE_MAP_MAP', TYPE_CLASSES.PRIMITIVE_MAP_MAP), 'MAP<STRING, MAP<STRING, DOUBLE>>');
    assert.equal(getTypeDescription('STRING_MAP_MAP', TYPE_CLASSES.PRIMITIVE_MAP_MAP), 'MAP<STRING, MAP<STRING, STRING>>');
    assert.equal(getTypeDescription('BOOLEAN_MAP_MAP', TYPE_CLASSES.PRIMITIVE_MAP_MAP), 'MAP<STRING, MAP<STRING, BOOLEAN>>');
    assert.equal(getTypeDescription('INTEGER_LIST', TYPE_CLASSES.PRIMITIVE_LIST), 'LIST<INTEGER>');
    assert.equal(getTypeDescription('LONG_LIST', TYPE_CLASSES.PRIMITIVE_LIST), 'LIST<LONG>');
    assert.equal(getTypeDescription('FLOAT_LIST', TYPE_CLASSES.PRIMITIVE_LIST), 'LIST<FLOAT>');
    assert.equal(getTypeDescription('DOUBLE_LIST', TYPE_CLASSES.PRIMITIVE_LIST), 'LIST<DOUBLE>');
    assert.equal(getTypeDescription('STRING_LIST', TYPE_CLASSES.PRIMITIVE_LIST), 'LIST<STRING>');
    assert.equal(getTypeDescription('BOOLEAN_LIST', TYPE_CLASSES.PRIMITIVE_LIST), 'LIST<BOOLEAN>');
    assert.equal(getTypeDescription('INTEGER_MAP_LIST', TYPE_CLASSES.PRIMITIVE_MAP_LIST), 'LIST<MAP<STRING, INTEGER>>');
    assert.equal(getTypeDescription('LONG_MAP_LIST', TYPE_CLASSES.PRIMITIVE_MAP_LIST), 'LIST<MAP<STRING, LONG>>');
    assert.equal(getTypeDescription('FLOAT_MAP_LIST', TYPE_CLASSES.PRIMITIVE_MAP_LIST), 'LIST<MAP<STRING, FLOAT>>');
    assert.equal(getTypeDescription('DOUBLE_MAP_LIST', TYPE_CLASSES.PRIMITIVE_MAP_LIST), 'LIST<MAP<STRING, DOUBLE>>');
    assert.equal(getTypeDescription('STRING_MAP_LIST', TYPE_CLASSES.PRIMITIVE_MAP_LIST), 'LIST<MAP<STRING, STRING>>');
    assert.equal(getTypeDescription('BOOLEAN_MAP_LIST', TYPE_CLASSES.PRIMITIVE_MAP_LIST), 'LIST<MAP<STRING, BOOLEAN>>');
  });

  test('it can wrap map and list keys', function(assert) {
    assert.equal(wrapMapKey('foo', 'bar'), `foo${MAP_ACCESSOR}bar`)
    assert.equal(wrapListIndex('foo', 1), `foo${LIST_ACCESSOR_START}1${LIST_ACCESSOR_END}`)
  });

  test('it can unwrap map and list keys', function(assert) {
    assert.equal(extractMapKey('foo'), 'foo')
    assert.equal(extractMapKey(`foo${MAP_ACCESSOR}bar`), 'bar')
    assert.equal(extractMapKey(`foo${MAP_ACCESSOR}bar${MAP_ACCESSOR}baz`), 'bar')
    assert.equal(extractMapKey(`foo${MAP_ACCESSOR}bar${MAP_ACCESSOR}baz${MAP_ACCESSOR}qux`), 'bar')

    assert.equal(extractListIndex('foo'), 'foo')
    assert.equal(extractListIndex(`foo${LIST_ACCESSOR_START}0${LIST_ACCESSOR_END}`), '0')
    assert.equal(extractListIndex(`foo${LIST_ACCESSOR_START}x${LIST_ACCESSOR_END}${MAP_ACCESSOR}baz`), 'x')
    assert.equal(extractListIndex(`foo${LIST_ACCESSOR_START}42${LIST_ACCESSOR_END}${MAP_ACCESSOR}qux${LIST_ACCESSOR_START}0${LIST_ACCESSOR_END}`), '42')
  });

});

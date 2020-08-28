/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import Enum from 'bullet-ui/utils/enum';

module('Unit | Utility | enum', function() {
  test('it allows you enumerate values without metadata', function(assert) {
    const COLORS = Enum.of(['RED', 'GREEN', 'BLUE']);
    let symbols = COLORS.symbols;
    let names = COLORS.names;

    assert.deepEqual(names, ['RED', 'GREEN', 'BLUE']);
    assert.deepEqual(symbols, [COLORS.RED, COLORS.GREEN, COLORS.BLUE]);

    for (let i = 0; i < 3; ++i) {
      assert.ok(COLORS.hasSymbol(symbols[i]));
      assert.ok(COLORS.hasName(names[i]));
      assert.equal(COLORS.forName(names[i]), symbols[i]);
      assert.equal(COLORS.forSymbol(symbols[i]), names[i]);
      assert.equal(COLORS.getMetaForName(names[i]), names[i]);
      assert.notOk(COLORS.getMetaEntryForName(names[i], 'foo'));
      assert.equal(COLORS.getMetaForSymbol(symbols[i]), names[i]);
      assert.notOk(COLORS.getMetaEntryForSymbol(symbols[i], 'foo'));
    }
    assert.notOk(COLORS.hasSymbol(Symbol.for('YELLOW')));
    assert.notOk(COLORS.hasName('YELLOW'));
  });

  test('it allows you enumerate values with metadata', function(assert) {
    const COLORS = Enum.of([
      { name: 'RED', rgb: '#F00' }, { name: 'GREEN', rgb: '#0F0' }, { name: 'BLUE', rgb: '#00F' }
    ]);
    let symbols = COLORS.symbols;
    let names = COLORS.names;

    assert.deepEqual(names, ['RED', 'GREEN', 'BLUE']);
    assert.deepEqual(symbols, [COLORS.RED, COLORS.GREEN, COLORS.BLUE]);

    assert.ok(COLORS.hasName('RED'));
    assert.ok(COLORS.hasName('GREEN'));
    assert.ok(COLORS.hasName('BLUE'));
    assert.equal(COLORS.forName('RED'), COLORS.RED);
    assert.equal(COLORS.forName('GREEN'), COLORS.GREEN);
    assert.equal(COLORS.forName('BLUE'), COLORS.BLUE);
    assert.deepEqual(COLORS.getMetaForSymbol(COLORS.RED), { name: 'RED', rgb: '#F00' });
    assert.deepEqual(COLORS.getMetaForSymbol(COLORS.GREEN), { name: 'GREEN', rgb: '#0F0' });
    assert.deepEqual(COLORS.getMetaForSymbol(COLORS.BLUE), { name: 'BLUE', rgb: '#00F' });
    assert.equal(COLORS.getMetaEntryForSymbol(COLORS.RED, 'rgb'), '#F00');
    assert.equal(COLORS.getMetaEntryForSymbol(COLORS.GREEN, 'rgb'), '#0F0');
    assert.equal(COLORS.getMetaEntryForSymbol(COLORS.BLUE, 'rgb'), '#00F');

    assert.notOk(COLORS.hasName('YELLOW'));
    assert.notOk(COLORS.hasSymbol(Symbol.for('YELLOW')));
    assert.notOk(COLORS.getMetaEntryForName('RED', 'foo'));
    assert.notOk(COLORS.getMetaEntryForSymbol(COLORS.RED, 'foo'));
  });

  test('it does not allow non-strings or objects for enumerations', function(assert) {
    assert.expect(1);
    try {
      Enum.of(['RED', { name: 'GREEN', rgb: '#0F0' }, () => 'BLUE']);
    } catch (e) {
      assert.equal(e.message, 'Enum values must be string or object');
    }
  });

  test('it does not allow the string names as an enum name', function(assert) {
    assert.expect(1);
    try {
      Enum.of(['names']);
    } catch (e) {
      assert.equal(e.message, 'Enum names must not include metadata or names');
    }
  });

  test('it does not allow the string metadata as an enum name', function(assert) {
    assert.expect(1);
    try {
      Enum.of([{ name: 'metadata' }]);
    } catch (e) {
      assert.equal(e.message, 'Enum names must not include metadata or names');
    }
  });
});

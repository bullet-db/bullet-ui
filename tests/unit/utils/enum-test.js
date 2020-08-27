/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { module, test } from 'qunit';
import Enum from 'bullet-ui/utils/enum';

module('Unit | Utility | enum', function() {
  test('it allows you enumerate values without metadata', function(assert) {
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
});

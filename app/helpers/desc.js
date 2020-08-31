/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { helper } from '@ember/component/helper';

export function desc([describableEnum, symbol]) {
  return describableEnum.describe(symbol);
}

export default helper(desc);

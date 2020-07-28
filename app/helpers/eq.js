/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { helper } from '@ember/component/helper';

export function eq([first, second]) {
  return first === second;
}

export default helper(eq);

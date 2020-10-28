/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
const ERRORS = {
  SINGLE_LINE: {
    meta: {
      errors: [{ error: '15:3: Test:Error' }]
    }
  },
  SINGLE_NO_LINE: {
    meta: {
      errors: [{ error: 'Test:Error' }]
    }
  },
  MULTIPLE: {
    meta: {
      errors: [
        { error: 'Test:Error' },
        { error: 'Test Error' },
        { error: '1:3: Test:Error' },
        { error: '2:13: Another Error' }
      ]
    }
  }
}

export default ERRORS;

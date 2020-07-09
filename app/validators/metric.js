/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import validateMetricField from 'bullet-ui/validators/metric-field';

export default {
  field: [
    validateMetricField()
  ],
  kind: [
    validateMetricField()
  ]
}

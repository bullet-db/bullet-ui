/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { validatePresence, validateNumber } from 'ember-changeset-validations/validators';
import validateAggregationMaxSize from 'bullet-ui/validators/aggregation-max-size';
import validatePoints from 'bullet-ui/validators/valid-points';

export default {
  size: [
    validatePresence({ presence: true, ignoreBlank: true }),
    validateNumber({ gte: 1, message: 'Maximum results must be a positive integer' }),
    validateAggregationMaxSize()
  ],
  distributionType: [validatePoints()],
  pointType: [validatePoints()],
  numberOfPoints: [validatePoints()],
  points: [validatePoints()],
  start: [validatePoints()],
  end: [validatePoints()],
  increment: [validatePoints()]
}

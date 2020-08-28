/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import { METRIC_TYPES } from 'bullet-ui/utils/query-constants';

export default class MetricModel extends Model {
  @attr('string', { defaultValue: METRIC_TYPES.describe(METRIC_TYPES.SUM) }) type;
  @attr('string') field;
  @attr('string') name;
  @belongsTo('aggregation', { autoSave: true }) aggregation;
}

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';

export default class GroupModel extends Model {
  @attr('string') field;
  @attr('string') name;
  @belongsTo('aggregation', { autoSave: true }) aggregation;
}

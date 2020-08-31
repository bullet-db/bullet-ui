/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import EmberObject from '@ember/object';

export default class AggregationModel extends Model {
  @attr('string') type;
  @attr('number') size;
  @hasMany('group', { dependent: 'destroy' }) groups;
  @hasMany('metric', { dependent: 'destroy' }) metrics;
  @attr({ defaultValue: () => EmberObject.create() }) attributes;
  @belongsTo('query', { autoSave: true }) query;
}

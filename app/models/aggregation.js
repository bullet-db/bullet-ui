/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import EmberObject from '@ember/object';

export const ATTRIBUTES = [
  'newName', 'threshold',
  'distributionType', 'pointType', 'numberOfPoints', 'start', 'end', 'increment', 'points'
];

export default class AggregationModel extends Model {
  @attr('string') type;
  @attr('number') size;
  @attr('string') newName;
  @attr('string') distributionType;
  @attr('number') threshold;
  @attr('string') pointType;
  @attr('number') numberOfPoints;
  @attr('number') start;
  @attr('number') end;
  @attr('number') increment;
  @attr('string') points;
  @hasMany('group', { dependent: 'destroy' }) groups;
  @hasMany('metric', { dependent: 'destroy' }) metrics;
  @belongsTo('query', { autoSave: true }) query;
}

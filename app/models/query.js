/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

/* eslint-disable ember/no-get */
// Need to disable since gets are needed here for ObjectProxy

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';

export default class QueryModel extends Model {
  @attr('string') name;
  @belongsTo('filter') filter;
  @hasMany('projection', { dependent: 'destroy' }) projections;
  @belongsTo('aggregation') aggregation;
  @belongsTo('window') window;
  @attr('number', { defaultValue: 20000 }) duration;
  @belongsTo('bql', { inverse: null }) bql;

  @alias('bql.latestResult') latestResult;
  @alias('bql.query') query;

  @computed('window.id')
  get isWindowless() {
    return isEmpty(this.get('window.id'));
  }

  @computed('bql.results.[]')
  get results() {
    let results = this.get('bql.results');
    return isEmpty(results) ? A() : results;
  }
}

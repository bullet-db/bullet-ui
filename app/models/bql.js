/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import QueryConverter from 'bullet-ui/utils/query-converter';

export default class BqlModel extends Model {
  @attr('string') name;
  @attr('string') query;
  @attr('date', { defaultValue: () => new Date(Date.now()) }) created;
  @hasMany('result', { async: true, dependent: 'destroy' }) results;

  @computed('name', 'query')
  get builderQuery() {
    if (isEmpty(this.query)) {
      return null;
    }
    let result = QueryConverter.recreateQuery(this.query);
    if (!isEmpty(result)) {
      result.set('name', this.name);
    }
    return result;
  }

  get isWindowless() {
    let query = this.builderQuery;
    return isEmpty(query) || isEmpty(query.window);
  }
}

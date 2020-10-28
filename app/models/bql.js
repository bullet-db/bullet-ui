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

  get isBQL() {
    return true;
  }

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

  @computed('results.[]')
  get latestResult() {
    let results = this.results;
    if (isEmpty(results)) {
      return null;
    }
    // Earliest date
    let latest = new Date(1);
    let max;
    results.forEach(result => {
      let current = result.get('created');
      if (current > latest) {
        max = result;
        latest = current;
      }
    });
    return max;
  }

}

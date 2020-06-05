/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';

export default class FilterModel extends Model {
  // Stores the AST of the filter clauses.
  @attr() clause;
  @attr('string') summary;
  @belongsTo('query', { autoSave: true }) query;
}

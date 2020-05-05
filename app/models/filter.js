/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';

export default Model.extend({
  // Stores the AST of the filter clauses.
  clause: attr(),
  summary: attr('string'),
  query: belongsTo('query', { autoSave: true })
});

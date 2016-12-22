/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import DS from 'ember-data';

export default DS.Model.extend({
  // Stores the AST of the filter clauses.
  clause: DS.attr(),
  summary: DS.attr('string'),
  query: DS.belongsTo('query', { autoSave: true })
});

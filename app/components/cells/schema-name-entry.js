/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';

export default Ember.Component.extend({
  classNames: ['schema-name-entry'],
  classNameBindings: ['row.hasEnumerations'],
  tagName: 'span',

  extractedValue: Ember.computed('row', function() {
    let row = this.get('row');
    let name = row.get('name');
    return row.get('isSubfield') ? name.substring(name.lastIndexOf(SUBFIELD_SEPARATOR) + 1) : name;
  })
});

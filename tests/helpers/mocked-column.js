/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import EmberObject from '@ember/object';

export default EmberObject.extend({
  name: null,
  type: null,
  subtype: null,
  description: null,
  // Computed properties as actual properties
  qualifiedType: null,
  flattenedColumns: null,
  enumeratedColumns: null,
  hasFreeformField: false,
  hasEnumerations: false,

  init() {
    this._super(...arguments);

    this.set('enumeratedColumns', A());
    let { name, type, subtype, description, hasFreeformField } = this;
    let me = EmberObject.create({ name, type, description });
    this.set('flattenedColumns', A([me]));
    if (hasFreeformField) {
      this.flattenedColumns.pushObject(EmberObject.create({ name, type: subtype, hasFreeformField: true }));
    }
    this.set('qualifiedType', isEmpty(subtype) ? type : `${type} OF ${subtype}S`);
  },

  addEnumeration(name, description) {
    let enumeration = EmberObject.create({
      name: `${this.name}.${name}`,
      type: this.subtype,
      qualifiedType: this.subtype,
      description: description,
      isSubfield: true
    });
    this.set('hasEnumerations', true);
    this.enumeratedColumns.pushObject(enumeration);
    this.flattenedColumns.pushObject(enumeration);
  }
});

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
    let props = this.getProperties('name', 'type', 'subtype', 'description', 'hasFreeformField');
    let me = EmberObject.create({ name: props.name, type: props.type, description: props.description });
    this.set('flattenedColumns', A([me]));
    if (props.hasFreeformField) {
      this.get('flattenedColumns').pushObject(EmberObject.create({ name: props.name, type: props.subtype, hasFreeformField: true }));
    }
    this.set('qualifiedType', isEmpty(props.subtype) ? props.type : `${props.type} OF ${props.subtype}S`);
  },

  addEnumeration(name, description) {
    let enumeration = EmberObject.create({
      name: `${this.get('name')}.${name}`,
      type: this.get('subtype'),
      qualifiedType: this.get('subtype'),
      description: description,
      isSubfield: true
    });
    this.set('hasEnumerations', true);
    this.get('enumeratedColumns').pushObject(enumeration);
    this.get('flattenedColumns').pushObject(enumeration);
  }
});

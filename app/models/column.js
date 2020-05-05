/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr } from '@ember-data/model';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';

export const SUBFIELD_SEPARATOR = '.';

export default Model.extend({
  name: attr('string'),
  type: attr('string'),
  subtype: attr('string'),
  description: attr('string'),
  enumerations: attr(),

  qualifiedType: computed('type', 'subtype', function() {
    let type = this.type;
    let subType = this.subtype;
    let qualifiedType = type;
    if (!isEmpty(subType)) {
      qualifiedType = type === 'MAP' ? `MAP OF STRINGS TO ${subType}S` : `${type} OF ${subType}S`;
    }
    return qualifiedType;
  }),

  hasEnumerations: computed('enumerations', function() {
    return !isEmpty(this.enumerations);
  }).readOnly(),

  hasFreeformField: computed('type', 'subtype', 'enumerations', function() {
    return this.type === 'MAP' && !isEmpty(this.subtype) && isEmpty(this.enumerations);
  }).readOnly(),

  enumeratedColumns: computed('name', 'subtype', 'enumerations', function() {
    let subColumns = A(this.enumerations);
    if (isEmpty(subColumns)) {
      return false;
    }
    let subColumnType = this.subtype;
    return subColumns.map(item => {
      let subColumn = EmberObject.create(item);
      let name = this.name;
      subColumn.set('name', `${name}${SUBFIELD_SEPARATOR}${item.name}`);
      subColumn.set('type', subColumnType);
      subColumn.set('qualifiedType', subColumnType);
      subColumn.set('description', item.description);
      subColumn.set('isSubfield', true);
      return subColumn;
    }, this);
  }).readOnly(),

  flattenedColumns: computed('type', 'subtype', 'enumeratedColumns', function() {
    let simplifiedColumns = A();
    // The main column
    simplifiedColumns.pushObject(EmberObject.create({
      name: this.name,
      type: this.type
    }));
    // The free form subfield
    let hasFreeformField = this.hasFreeformField;
    if (hasFreeformField) {
      simplifiedColumns.pushObject(EmberObject.create({
        name: this.name,
        type: this.subtype,
        description: this.description,
        hasFreeformField: hasFreeformField
      }));
    }
    let enumerated = this.enumeratedColumns;
    if (enumerated) {
      simplifiedColumns.addObjects(enumerated);
    }
    return simplifiedColumns;
  }).readOnly()
});

/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr } from '@ember-data/model';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import {
  SUBFIELD_SEPARATOR, TYPES, TYPE_CLASSES,
  getBasePrimitive, getTypeClass, getTypeDescription
} from 'bullet-ui/utils/type';

export default class ColumnModel extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('string') description;
  @attr() subFields;
  @attr() subSubFields;
  @attr() subListFields;

  @computed('type')
  get fullType() {
    return TYPES.forName(this.type);
  }

  @computed('type')
  get typeClass() {
    return getTypeClass(this.type);
  }

  get qualifiedType() {
    return getTypeDescription(this.typeClass);
  }

  get hasEnumerations() {
    return !isEmpty(this.subFields) || !isEmpty(this.subSubFields) || !isEmpty(this.subListFields);
  }

  get hasFreeformField() {
    let typeClass = this.typeClass;
    return typeClass === TYPE_CLASSES.PRIMITIVE_MAP || typeClass === TYPE_CLASSES.PRIMITIVE_MAP_MAP;
  }

  get enumeratedColumns() {
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
  }

  @computed('name', 'type', 'subtype', 'description', 'hasFreeformField', 'enumeratedColumns')
  get flattenedColumns() {
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
  }

  static subfieldAsColumn(subfield, parentField) {
    let subColumn = Object.assign({ }, subfield);
    subColumn.name = `${parentField.name}${SUBFIELD_SEPARATOR}${item.name}`;
    subColumn.type = getSubtype(parentField.type);
    subColumn.qualifiedType = getTypeDescription(subColumn.type);
    subColumn.isSubfield = true;
    return subColumn;
  }
}

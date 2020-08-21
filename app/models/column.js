/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr } from '@ember-data/model';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import { FREEFORM_SUFFIX } from 'bullet-ui/utils/builder-adapter';
import {
  MAP_ACCESSOR, TYPES, TYPE_CLASSES,
  getBasePrimitive, getTypeClass, getTypeDescription, wrapMapKey, wrapListIndex
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

  get hasFreeFormField() {
    let typeClass = this.typeClass;
    return typeClass === TYPE_CLASSES.PRIMITIVE_MAP || typeClass === TYPE_CLASSES.PRIMITIVE_MAP_MAP;
  }

  get enumeratedColumns() {
    let enumerated = [];
    let subtype = getSubtype(this.type);
    let subColumns = Column.subFieldsAsColumns(this.subFields, subtype, name => wrapMapKey(this.name, name));
    let subSubColumns = Column.subFieldsAsColumns(
      this.subSubFields, getSubtype(subtype), name => wrapMapKey(`${this.name}${FREEFORM_SUFFIX}`, name)
    );
    let sublistcolumns = Column.subFieldsAsColumns(
      this.subSubFields, getSubtype(subtype), name => wrapMapKey(`${this.name}${FREEFORM_SUFFIX}`, name)
    );
    if (!isEmpty(subFields)) {
    }
    if (!isEmpty(subSubFields)) {
    }
    if (!isEmpty(subListFields)) {
    }
    return enumerated;

    return subColumns.map(item => {
      let subColumn = EmberObject.create(item);
      let name = this.name;
      subColumn.set('name', `${name}${MAP_ACCESSOR}${item.name}`);
      subColumn.set('type', subColumnType);
      subColumn.set('qualifiedType', subColumnType);
      subColumn.set('description', item.description);
      subColumn.set('isSubField', true);
      return subColumn;
    }, this);
  }

  @computed('name', 'type', 'subtype', 'description', 'hasFreeFormField', 'enumeratedColumns')
  get flattenedColumns() {
    let simplifiedColumns = A();
    // The main column
    simplifiedColumns.pushObject(EmberObject.create({
      name: this.name,
      type: this.type
    }));
    // The free form subField
    let hasFreeFormField = this.hasFreeFormField;
    if (hasFreeFormField) {
      simplifiedColumns.pushObject(EmberObject.create({
        name: this.name,
        type: this.subtype,
        description: this.description,
        hasFreeFormField: hasFreeFormField
      }));
    }
    let enumerated = this.enumeratedColumns;
    if (enumerated) {
      simplifiedColumns.addObjects(enumerated);
    }
    return simplifiedColumns;
  }

  static subFieldsAsColumns(subFields, subFieldType, nameMapper) {
    if (isEmpty(subFields)) {
      return [];
    }
    let enumerated = [];
    subFields.forEach(subField => {
      let subColumn = { };
      subColumn.name = nameMapper(subField.name);
      subColumn.description = subField.description;
      subColumn.type = subFieldType;
      subColumn.qualifiedType = getTypeDescription(subFieldType);
      subColumn.isSubField = true;
      enumerated.push(subColumn);
    });
    return enumerated;
  }
}

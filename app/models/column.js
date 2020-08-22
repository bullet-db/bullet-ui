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
  FREEFORM, MAP_FREEFORM_SUFFIX,
  getTypeClass, getTypeDescription, wrapMapKey, wrapListIndex } from 'bullet-ui/utils/type';

export default class ColumnModel extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('string') description;
  @attr() subFields;
  @attr() subSubFields;
  @attr() subListFields;

  @computed('type')
  get typeClass() {
    return getTypeClass(this.type);
  }

  @computed('type')
  get subType() {
    return getSubType(this.type);
  }

  get subSubType() {
    return getSubType(this.subType);
  }

  get qualifiedType() {
    return getTypeDescription(this.type, this.typeClass);
  }

  get hasEnumerations() {
    return !isEmpty(this.subFields) || !isEmpty(this.subSubFields) || !isEmpty(this.subListFields);
  }

  get hasFreeFormSubField() {
    return this.typeClass === TYPE_CLASSES.PRIMITIVE_MAP || this.typeClass === TYPE_CLASSES.PRIMITIVE_MAP_MAP;
  }

  get hasFreeFormSubSubField() {
    return this.typeClass === TYPE_CLASSES.PRIMITIVE_MAP_MAP;
  }

  get enumeratedMapColumns() {
    let subFieldMapper = name => wrapMapKey(this.name, name);
    return A(Column.subFieldsAsColumns(this.subFields, this.subType, true, subFieldMapper, true));
  }

  get enumeratedSubMapColumns() {
    let subSubFieldMapper = name => wrapMapKey(`${this.name}${MAP_FREEFORM_SUFFIX}`, name);
    return A(Column.subFieldsAsColumns(this.subSubFields, this.subSubType, true, subSubFieldMapper, true));
  }

  get enumeratedSubListColumns() {
    let freeFormListIndex = wrapListIndex(this.name, FREEFORM);
    let subListFieldMapper = name => wrapMapkey(freeFormListIndex, name);
    return A(Column.subFieldsAsColumns(this.subListFields, this.subSubType, true, subListFieldMapper, true));
  }

  get enumeratedColumns() {
    let enumerated = this.enumeratedMapColumns;
    A.addObjects(this.enumeratedSubMapColumns);
    A.addObjects(this.enumeratedSubListColumns);
    return enumerated;
  }

  get flattenedColumns() {
    let subType = this.subType;
    let subSubType = this.subSubType;
    let subFieldNameMapper = name => wrapMapKey(this.name, name);
    let simplifiedColumns = A();

    // The main field. Has no subField
    simplifiedColumns.pushObject(Column.asColumn(this.name, this.type, false, { }));

    let subFields = this.enumeratedMapColumns;
    // The free form first level map - map.*
    if (this.hasFreeFormSubField) {
      simplifiedColumns.pushObject(Column.asColumn(this.name, subType, true, { }));
    }
    // The named first level maps - map.x They don't have subFields
    simplifiedColumns.addObjects(Column.subFieldsAsColumns(subFields, subType, false, subFieldNameMapper, false));

    // The free-form second level maps - map.x.*
    if (this.hasFreeFormSubSubField) {
      simplifiedColumns.addObjects(Column.subFieldsAsColumns(subFields, subSubType, true, subFieldNameMapper, false));
    }
    // The named second level maps - map.x.y. Only if subFields and subSubFields are not empty
    let subSubFields = this.subSubFields;
    if (!isEmpty(subFields) && !isEmpty(subSubFields)) {
      subFields.forEach(subField => {
        let prefix = wrapMapKey(this.name, subfield.name);
        let subSubFieldNameMapper = name => wrapMapKey(prefix, name);
        subSubFields.forEach(subSubField => {
          simplifiedColumns.pushObject(Column.asColumn(subSubField.name, subSubType, false, { nameMapper: subSubFieldNameMapper }));
        })
      });
    }
    return simplifiedColumns;
  }

  static subFieldsAsColumns(subFields, subFieldType, isSubField, nameMapper, getQualifiedType) {
    if (isEmpty(subFields)) {
      return [];
    }
    let type = subFieldType;
    let qualifiedType = getQualifiedType ? getTypeDescription(subFieldType) : undefined;
    return subFields.map(field => Column.asColumn(
      field.name, type, isSubField, { qualifiedType, description: field.description, nameMapper }
    ));
  }

  static asColumn(name, type, isSubField, { qualifiedType, description, nameMapper } ) {
    return { name: nameMapper ? nameMapper(name) : name, description, type, qualifiedType, isSubField };
  }
}

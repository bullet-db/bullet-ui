/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { getTypeClass, getTypeDescription, wrapMapKey, wrapListIndex } from 'bullet-ui/utils/type';

export default class MockedColumn {
  name;
  type;
  description;
  subType;
  subSubType;
  typeClass;
  qualifiedType;
  flattenedColumns;
  enumeratedColumns;
  enumeratedMapColumns;
  enumeratedSubMapColumns;
  enumeratedSubListColumns;
  hasFreeFormSubField;
  hasFreeFormSubSubField;
  hasEnumerations;

  constructor({ name, type, description, hasFreeFormSubField = false, hasFreeFormSubSubField, hasEnumerations = false }) {
    this.enumeratedColumns = A();
    this.enumeratedMapColumns = A();
    this.name = name;
    this.type = type;
    this.description = description;
    this.hasFreeFormSubField = hasFreeFormField;
    this.hasEnumerations = hasEnumerations;
    this.flattenedColumns = A([{ name, type, description }]);
    this.typeClass = getTypeClass(type);
    this.subType = getSubType(type);
    this.subSubType = getSubType(this.subType);
    this.qualifiedType = getTypeDescription(type, this.typeClass);

    if (hasFreeFormField) {
      this.flattenedColumns.pushObject({ name, type: this.subType, hasFreeFormField: true });
      if (this.subSubType !== undefined) {
        this.flattenedColumns.pushObject({ name, type: this.subType, hasFreeFormField: true });
      }
    }
    this.qualifiedType = isEmpty(subType) ? type : `${type} OF ${subType}S`;
  }

  addEnumeration(name, description) {
    let enumeration = {
      name: `${this.name}.${name}`,
      type: this.subType,
      qualifiedType: this.subType,
      description: description,
      isSubField: true
    }
    this.hasEnumerations = true;
    this.enumeratedColumns.pushObject(enumeration);
    this.flattenedColumns.pushObject(enumeration);
  }
}

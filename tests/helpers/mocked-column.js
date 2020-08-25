/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import {
  TYPES, TYPE_CLASSES, FREEFORM, MAP_FREEFORM_SUFFIX,
  getTypeClass, getSubType, getTypeDescription, wrapMapKey, wrapListIndex
} from 'bullet-ui/utils/type';

export default class MockedColumn {
  name;
  type;
  description;
  subType;
  subSubType;
  typeClass;
  typeName;
  flattenedColumns;
  enumeratedColumns;
  enumeratedMapColumns;
  enumeratedSubMapColumns;
  enumeratedSubListColumns;
  hasFreeFormSubField;
  hasFreeFormSubSubField;
  hasEnumerations;

  constructor({ name, type, description }) {
    this.name = name;
    this.type = type;
    this.description = description;

    let typeClass = getTypeClass(type);
    this.subType = getSubType(type);
    this.subSubType = getSubType(this.subType);
    this.typeClass = typeClass;
    this.typeName = getTypeDescription(type, typeClass);
    this.flattenedColumns = A([{ name, type, description }]);
    this.hasFreeFormSubField = typeClass === TYPE_CLASSES.PRIMITIVE_MAP || typeClass == TYPE_CLASSES.PRIMITIVE_MAP_MAP;
    this.hasFreeFormSubSubField = typeClass === TYPE_CLASSES.PRIMITIVE_MAP_MAP;

    if (hasFreeFormSubField) {
      this.flattenedColumns.pushObject({ name, type: this.subType, isSubField: true });
    }
    this.enumeratedColumns = A();
    this.enumeratedMapColumns = A();
    this.enumeratedSubMapColumns = A();
    this.enumeratedSubListColumns = A();
  }

  addEnumeration(name, type, description) {
    let enumeration = {
      name: name,
      type: type,
      description: description,
      typeName: getTypeDescription(type),
    };
    this.hasEnumerations = true;
    let object = EmberObject.create(enumeration);
    this.enumeratedColumns.pushObject(object);
    this.flattenedColumns.pushObject(object);
    return enumeration;
  }

  addMapEnumeration(name, description) {
    let enumeration = this.addEnumeration(wrapMapKey(this.name, name), this.subType, description);
    this.enumeratedMapColumns.pushObject(enumeration);
    if (this.hasFreeFormSubSubField) {
      let subEnumeration = Object.assign({ }, enumeration);
      subEnumeration.isSubField = true;
      this.flattenedColumns.pushObject(EmberObject.create(subEnumeration));
    }
  }

  addSubMapEnumeration(name, description) {
    this.enumeratedMapColumns.forEach(column => {
      let columnName = wrapMapKey(wrapMapKey(this.name, column.name), name);
      let enumeration = this.addEnumeration(columnName, this.subSubType, description);
      this.enumeratedSubMapColumns.pushObject(EmberObject.create(enumeration));
    })
  }

  addSubListEnumeration(name, description) {
    let columName = wrapMapKey(wrapListIndex(this.name, FREEFORM), name);
    let enumeration = this.addEnumeration(columnName, this.subSubType, description);
    this.enumeratedSubListColumns.pushObject(EmberObject.create(enumeration));
  }
}

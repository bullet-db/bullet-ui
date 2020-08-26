/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import {
  TYPE_CLASSES, FREEFORM, MAP_FREEFORM_SUFFIX,
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
  hasFreeFormSubField;
  hasFreeFormSubSubField;
  hasEnumerations;

  constructor({ name, type, description }) {
    this.name = name;
    this.type = type;
    this.description = description;

    let typeClass = getTypeClass(type);
    let subType = getSubType(type);
    this.subType = subType;
    this.subSubType = subType ? getSubType(subType) : subType;
    this.typeClass = typeClass;
    this.typeName = getTypeDescription(type, typeClass);
    this.flattenedColumns = A([EmberObject.create({ name, type, description })]);
    this.hasFreeFormSubField = typeClass === TYPE_CLASSES.PRIMITIVE_MAP || typeClass == TYPE_CLASSES.PRIMITIVE_MAP_MAP;
    this.hasFreeFormSubSubField = typeClass === TYPE_CLASSES.PRIMITIVE_MAP_MAP;

    if (this.hasFreeFormSubField) {
      this.flattenedColumns.pushObject(EmberObject.create({ name, type: this.subType, isSubField: true }));
    }
    this.enumeratedColumns = A();
    this.enumeratedMapColumns = A();
  }

  static makeEnumeration(name, type, description, isSubField = true) {
    let enumeration = {
      name: name,
      type: type,
      description: description,
      isSubField: isSubField,
      typeName: getTypeDescription(type, getTypeClass(type))
    };
    return enumeration;
  }

  addMapEnumeration(name, description) {
    this.hasEnumerations = true;
    let enumeration = MockedColumn.makeEnumeration(wrapMapKey(this.name, name), this.subType, description);
    let object = EmberObject.create(enumeration);
    this.enumeratedColumns.pushObject(object);
    this.enumeratedMapColumns.pushObject(object);

    enumeration.isSubField = undefined;
    this.flattenedColumns.pushObject(EmberObject.create(enumeration));

    if (this.hasFreeFormSubSubField) {
      let subEnumeration = MockedColumn.makeEnumeration(wrapMapKey(this.name, name), this.subSubType, description);
      this.flattenedColumns.pushObject(EmberObject.create(subEnumeration));
    }
  }

  addSubMapEnumeration(name, description) {
    this.hasEnumerations = true;
    let columnName = wrapMapKey(`${this.name}${MAP_FREEFORM_SUFFIX}`, name);
    let enumeration = MockedColumn.makeEnumeration(columnName, this.subSubType, description);
    this.enumeratedColumns.pushObject(EmberObject.create(enumeration));

    enumeration.isSubField = undefined;
    this.enumeratedMapColumns.forEach(column => {
      enumeration.name = wrapMapKey(column.name, name);
      this.flattenedColumns.pushObject(EmberObject.create(enumeration));
    });
  }

  addSubListEnumeration(name, description) {
    this.hasEnumerations = true;
    let columnName = wrapMapKey(wrapListIndex(this.name, FREEFORM), name);
    let object = EmberObject.create(MockedColumn.makeEnumeration(columnName, this.subSubType, description));
    this.enumeratedColumns.pushObject(object);
  }
}

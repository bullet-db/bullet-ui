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
  FREEFORM, MAP_FREEFORM_SUFFIX, TYPE_CLASSES,
  getTypeClass, getSubType, getTypeDescription, wrapMapKey, wrapListIndex
} from 'bullet-ui/utils/type';

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
    let subType = this.subType;
    return subType ? getSubType(subType) : subType;
  }

  get typeName() {
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
    return A(ColumnModel.toColumns(this.subFields, this.subType, true, subFieldMapper, true));
  }

  get enumeratedSubMapColumns() {
    let subSubFieldMapper = name => wrapMapKey(`${this.name}${MAP_FREEFORM_SUFFIX}`, name);
    return A(ColumnModel.toColumns(this.subSubFields, this.subSubType, true, subSubFieldMapper, true));
  }

  get enumeratedSubListColumns() {
    let subListFieldMapper = name => wrapMapKey(wrapListIndex(this.name, FREEFORM), name);
    return A(ColumnModel.toColumns(this.subListFields, this.subSubType, true, subListFieldMapper, true));
  }

  get enumeratedColumns() {
    let enumerated = A();
    enumerated.addObjects(this.enumeratedMapColumns);
    enumerated.addObjects(this.enumeratedSubMapColumns);
    enumerated.addObjects(this.enumeratedSubListColumns);
    return enumerated;
  }

  get flattenedColumns() {
    let subType = this.subType;
    let subSubType = this.subSubType;
    let subFieldNameMapper = name => wrapMapKey(this.name, name);
    let simplifiedColumns = A();

    // The main field. Has no subField
    simplifiedColumns.pushObject(ColumnModel.toColumn(this.name, this.type, false, { }));

    // The free form first level map - map.*
    if (this.hasFreeFormSubField) {
      simplifiedColumns.pushObject(ColumnModel.toColumn(this.name, subType, true, { }));
    }

    // The named first level maps - map.x They don't have subFields
    let subFields = this.subFields;
    simplifiedColumns.addObjects(ColumnModel.toColumns(subFields, subType, false, subFieldNameMapper, false));

    // The free-form second level maps - map.x.*
    if (this.hasFreeFormSubSubField) {
      this.enumeratedMapColumns.forEach(column =>
        simplifiedColumns.pushObject(ColumnModel.toColumn(column.name, subSubType, true, { }))
      );
    }
    // The named second level maps - map.x.y. Only if subFields and subSubFields are not empty
    let subSubFields = this.subSubFields;
    if (!isEmpty(subFields) && !isEmpty(subSubFields)) {
      subFields.forEach(subField => {
        let prefix = wrapMapKey(this.name, subField.name);
        let subSubFieldNameMapper = name => wrapMapKey(prefix, name);
        subSubFields.forEach(subSubField => {
          let column = ColumnModel.toColumn(subSubField.name, subSubType, false, { nameMapper: subSubFieldNameMapper });
          simplifiedColumns.pushObject(column);
        })
      });
    }
    return simplifiedColumns;
  }

  static toColumns(subFields, subFieldType, isSubField, nameMapper, getTypeName) {
    if (isEmpty(subFields)) {
      return [];
    }
    let type = subFieldType;
    let typeName = getTypeName ? getTypeDescription(subFieldType, getTypeClass(subFieldType)) : undefined;
    return subFields.map(field =>
      ColumnModel.toColumn(field.name, type, isSubField, { typeName, description: field.description, nameMapper })
    );
  }

  static toColumn(name, type, isSubField, { typeName, description, nameMapper } ) {
    return EmberObject.create({ name: nameMapper ? nameMapper(name) : name, description, type, typeName, isSubField });
  }
}

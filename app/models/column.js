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
    return getTypeDescription(this.typeClass);
  }

  get hasEnumerations() {
    return !isEmpty(this.subFields) || !isEmpty(this.subSubFields) || !isEmpty(this.subListFields);
  }

  get hasFreeFormField() {
    let typeClass = this.typeClass;
    return typeClass === TYPE_CLASSES.PRIMITIVE_MAP || typeClass === TYPE_CLASSES.PRIMITIVE_MAP_MAP;
  }

  get enumeratedMapColumns() {
    let subFieldMapper = name => wrapMapKey(this.name, name);
    let subSubFieldMapper = name => wrapMapKey(`${this.name}${FREEFORM_SUFFIX}`, name);
    return [
      ...Column.subFieldsAsColumns(this.subFields, this.subType, subFieldMapper),
      ...Column.subFieldsAsColumns(this.subSubFields, this.subSubType, subSubFieldMapper),
    ];
  }

  get enumeratedColumns() {
    let freeFormListIndex = wrapListIndex(this.name, FREEFORM_SUFFIX);
    let subListFieldMapper = name => wrapMapkey(freeFormListIndex, name);

    return [
      ...this.enumeratedMapColumns,
      ...Column.subFieldsAsColumns(this.subListFields, this.subSubType, subListFieldMapper)
    ];
  }

  get flattenedColumns() {
    let simplifiedColumns = A();
    // The main column
    simplifiedColumns.pushObject({ name: this.name, type: this.type });
    // The free form subField
    if (this.hasFreeFormField) {
      let subType = getSubType(this.type);
      simplifiedColumns.pushObject({ name: this.name, type: this.subType, description: this.description, hasFreeFormField: true });
    }
    let enumerated = this.enumeratedMapColumns;
    if (enumerated) {
      simplifiedColumns.addObjects(enumerated);
    }
    return simplifiedColumns;
  }

  static subFieldsAsColumns(subFields, subFieldType, nameMapper) {
    if (isEmpty(subFields)) {
      return [];
    }
    let type = subFieldType;
    let qualifiedType = getTypeDescription(subFieldType);
    return subFields.map(field => {
      return { name: nameMapper(field.name), description: field.description, type, qualifiedType, isSubField: true };
    });
  }
}

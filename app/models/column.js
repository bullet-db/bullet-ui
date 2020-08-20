/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr } from '@ember-data/model';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/utils/type';

export default class ColumnModel extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('string') subtype;
  @attr('string') description;
  @attr() enumerations;

  @computed('type', 'subtype')
  get qualifiedType() {
    let type = this.type;
    let subType = this.subtype;
    let qualifiedType = type;
    if (!isEmpty(subType)) {
      qualifiedType = type === 'MAP' ? `MAP OF STRINGS TO ${subType}S` : `${type} OF ${subType}S`;
    }
    return qualifiedType;
  }

  @computed('enumerations')
  get hasEnumerations() {
    return !isEmpty(this.enumerations);
  }

  @computed('type', 'subtype', 'enumerations')
  get hasFreeformField() {
    return this.type === 'MAP' && !isEmpty(this.subtype) && isEmpty(this.enumerations);
  }

  @computed('name', 'type', 'subtype', 'description', 'enumerations')
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
}
